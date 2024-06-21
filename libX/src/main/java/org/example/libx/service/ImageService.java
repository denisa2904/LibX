package org.example.libx.service;

import jakarta.transaction.Transactional;
import org.example.libx.firebase.FirebaseStorageStrategy;
import org.example.libx.model.Book;
import org.example.libx.model.Image;
import org.example.libx.repository.BookRepo;
import org.example.libx.repository.ImageRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Objects;
import java.util.Optional;
import java.util.UUID;
import java.util.logging.Logger;

@Service
@Transactional
public class ImageService {
    private final ImageRepo imageRepo;
    private final BookRepo bookRepo;
    private final FirebaseStorageStrategy firebaseStorageStrategy;

    @Autowired
    public ImageService(ImageRepo imageRepo, BookRepo bookRepo, FirebaseStorageStrategy firebaseStorageStrategy) {
        this.imageRepo = imageRepo;
        this.bookRepo = bookRepo;
        this.firebaseStorageStrategy = firebaseStorageStrategy;
    }

    private static final Logger logger = Logger.getLogger(BookService.class.getName());

    public Optional<Image> getImageByBookId(UUID bookId) {
        return imageRepo.findImageByBookId(bookId);
    }

    public int addImage(Image image, UUID bookId) {
        if(bookRepo.findById(bookId).isPresent())
        {
            image.setBook(bookRepo.findById(bookId).get());
            image.setTitle(bookId.toString());
            imageRepo.save(image);
            return 1;
        }
        return 0;
    }

    public int deleteImage(UUID imageId) throws IOException {
        Optional<Image> imageMaybe = imageRepo.findById(imageId);
        if(imageMaybe.isEmpty())
            return 0;
        Image image = imageMaybe.get();
        String path = image.getBook().getId().toString() + image.getType();
        if(firebaseStorageStrategy.deleteFile(imageId.toString())) {
            imageRepo.deleteById(imageId);
            return 1;
        }
        return 1;
    }

    public int uploadImage(UUID bookId, MultipartFile image) {
        if(!Objects.equals(image.getContentType(), "image/jpeg")
                && !Objects.equals(image.getContentType(), "image/png")
                && !Objects.equals(image.getContentType(), "image/jpg"))
            return 0;
        Optional<Book> book = bookRepo.findById(bookId);
        if(book.isEmpty())
            return 0;
        Optional<Image> oldImage = getImageByBookId(bookId);
        oldImage.ifPresent(value -> {
            try {
                String oldImageLocation = bookId + oldImage.get().getType();
                deleteImage(value.getId());
                imageRepo.delete(value);
                firebaseStorageStrategy.deleteFile(oldImageLocation);
            } catch (IOException e) {
                throw new RuntimeException(e);
            }
        });
        String id = book.get().getId().toString();
        String FileType = image.getContentType();
        Image image1 = new Image(id, FileType);
        if(addImage(image1, bookId) == 0)
            return 0;
        try{
            firebaseStorageStrategy.uploadBytes(image.getBytes(), bookId.toString(), FileType);
            return 1;
        } catch (Exception e) {
            logger.log(java.util.logging.Level.SEVERE, e.toString(), e);
            return 0;
        }
    }
}
