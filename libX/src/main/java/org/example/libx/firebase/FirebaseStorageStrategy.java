package org.example.libx.firebase;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import com.google.auth.Credentials;
import com.google.auth.oauth2.GoogleCredentials;
import com.google.cloud.storage.*;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;


@Service
public class FirebaseStorageStrategy {

    private final String firebasePropsPath = "src/main/resources/firebaseProps.json";

    private String uploadFile(File file, String fileName, String rootFolder) throws IOException {
        String unified = rootFolder + "/" + fileName;
        BlobId blobId = BlobId.of("gs://libx-bc35e.appspot.com", unified);
        BlobInfo blobInfo = BlobInfo.newBuilder(blobId).setContentType("media").build();
        Credentials credentials = GoogleCredentials.fromStream(new FileInputStream(firebasePropsPath));
        Storage storage = StorageOptions.newBuilder().setCredentials(credentials).build().getService();
        byte[] allBytes = Files.readAllBytes(file.toPath());
        storage.create(blobInfo, allBytes);
        String DOWNLOAD_URL = "https://firebasestorage.googleapis.com/v0/b/libx-bc35e.appspot.com/o/%s?alt=media";
        return String.format(DOWNLOAD_URL, URLEncoder.encode(fileName, StandardCharsets.UTF_8));
    }

    private File convertToFile(MultipartFile multipartFile, String fileName) throws IOException {
        File tempFile = new File(fileName);
        try (FileOutputStream fos = new FileOutputStream(tempFile)) {
            fos.write(multipartFile.getBytes());
        }
        return tempFile;
    }

    public boolean uploadBytes(byte[] bytes, String fileName, String rootFolder) throws IOException {
        String unified = rootFolder + "/" + fileName;
        BlobId blobId = BlobId.of("gs://libx-bc35e.appspot.com", unified);
        BlobInfo blobInfo = BlobInfo.newBuilder(blobId).setContentType("media").build();
        Credentials credentials = GoogleCredentials.fromStream(new FileInputStream(firebasePropsPath));
        Storage storage = StorageOptions.newBuilder().setCredentials(credentials).build().getService();
        storage.create(blobInfo, bytes);
        return true;
    }

    public boolean upload(MultipartFile multipartFile, String fileName, String rootFolder) {
        try {
            File file = this.convertToFile(multipartFile, fileName);
            String TEMP_URL = this.uploadFile(file, fileName, rootFolder);
            file.delete();
            return true;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    public byte[] download(String fullPath) throws IOException {
        try (FileInputStream serviceAccountStream = new FileInputStream(firebasePropsPath)) {
            Credentials credentials = GoogleCredentials.fromStream(serviceAccountStream);
            Storage storage = StorageOptions.newBuilder().setCredentials(credentials).build().getService();
            fullPath = fullPath + ".jpg";

            Blob blob = storage.get(BlobId.of("libx-bc35e.appspot.com", fullPath));
            if (blob == null) {
                System.out.println("BLOB IS NULL");
                throw new IOException("Blob not found for path: " + fullPath);
            }
            byte[] content = blob.getContent();
            if (content == null || content.length == 0) {
                System.out.println("Blob content is empty");
                throw new IOException("Blob content is empty for path: " + fullPath);
            }
            return content;
        } catch (IOException e) {
            System.err.println("Error in download method: " + e.getMessage());
            e.printStackTrace();
            throw new IOException("Failed to download file from Firebase Storage", e);
        }
    }

    public boolean deleteFile(String fullPath) throws IOException{
        BlobId blobId = BlobId.of("gs://libx-bc35e.appspot.com", fullPath);
        Credentials credentials = GoogleCredentials.fromStream(new FileInputStream(firebasePropsPath));
        Storage storage = StorageOptions.newBuilder().setCredentials(credentials).build().getService();
        return storage.delete(blobId);
    }
}
