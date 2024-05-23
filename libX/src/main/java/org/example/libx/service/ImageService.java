package org.example.libx.service;

import jakarta.transaction.Transactional;
import org.example.libx.firebase.FirebaseStorageStrategy;
import org.example.libx.model.Book;
import org.example.libx.model.Image;
import org.example.libx.repository.ImageRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.Optional;
import java.util.UUID;
import java.util.logging.Logger;

@Service
@Transactional
public class ImageService {
    private final ImageRepo imageRepo;
    private final BookService bookService;
    private final FirebaseStorageStrategy firebaseStorageStrategy;

    @Autowired
    public ImageService(ImageRepo imageRepo, BookService bookService, FirebaseStorageStrategy firebaseStorageStrategy) {
        this.imageRepo = imageRepo;
        this.bookService = bookService;
        this.firebaseStorageStrategy = firebaseStorageStrategy;
    }

    private static final Logger logger = Logger.getLogger(BookService.class.getName());

    public Optional<Image> getImageByBookId(UUID bookId) {
        return imageRepo.findImageByBookId(bookId);
    }

    public int addImage(Image image, UUID bookId) {
        if(bookService.getBookById(bookId).isPresent())
        {
            image.setBook(bookService.getBookById(bookId).get());
            image.setTitle(bookId.toString());
            imageRepo.save(image);
            return 1;
        }
        return 0;
    }

    public int deleteImage(UUID imageId) {
        imageRepo.deleteById(imageId);
        return 1;
    }

    public int uploadImage(UUID bookId, MultipartFile image) {
        Optional<Book> book = bookService.getBookById(bookId);
        if(book.isEmpty())
            return 0;
        Optional<Image> oldImage = getImageByBookId(bookId);
        String oldImageLocation = "";
        if(oldImage.isPresent()) {
            oldImageLocation = oldImage.get().getLocation();
            deleteImage(oldImage.get().getId());
        }

        String id = book.get().getId().toString();
        String fileName = id + "_" + image.getOriginalFilename();
        String FileType = image.getContentType();
        Image image1 = new Image(image.getOriginalFilename(), fileName, FileType);
        if(addImage(image1, bookId) == 0)
            return 0;
        try{
            firebaseStorageStrategy.deleteFile(oldImageLocation);
            firebaseStorageStrategy.upload(image, image.getOriginalFilename(), id);
            return 1;
        } catch (Exception e) {
            logger.log(java.util.logging.Level.SEVERE, e.toString(), e);
            return 0;
        }
    }
}
