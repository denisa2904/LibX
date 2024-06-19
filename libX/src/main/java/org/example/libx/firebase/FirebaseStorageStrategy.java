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
    public boolean uploadBytes(byte[] bytes, String fileName, String type) throws IOException {
        String type_ = type.split("/")[1];
        if (type_.equals("jpeg")) {
            type_ = "jpg";
        }
        String unified = fileName + '.' + type_;
        BlobId blobId = BlobId.of("libx-bc35e.appspot.com", unified);
        BlobInfo blobInfo = BlobInfo.newBuilder(blobId).setContentType(type).build();
        Credentials credentials = GoogleCredentials.fromStream(new FileInputStream(firebasePropsPath));
        Storage storage = StorageOptions.newBuilder().setCredentials(credentials).build().getService();
        storage.create(blobInfo, bytes);
        return true;
    }

    public byte[] download(String fullPath) throws IOException {
        try (FileInputStream serviceAccountStream = new FileInputStream(firebasePropsPath)) {
            Credentials credentials = GoogleCredentials.fromStream(serviceAccountStream);
            Storage storage = StorageOptions.newBuilder().setCredentials(credentials).build().getService();

            Blob blob = storage.get(BlobId.of("libx-bc35e.appspot.com", fullPath));
            if (blob == null) {
                throw new IOException("Blob not found for path: " + fullPath);
            }
            byte[] content = blob.getContent();
            if (content == null || content.length == 0) {
                throw new IOException("Blob content is empty for path: " + fullPath);
            }
            return content;
        } catch (IOException e) {
            throw new IOException("Failed to download file from Firebase Storage", e);
        }
    }

    public boolean deleteFile(String fullPath) throws IOException{
        BlobId blobId = BlobId.of("libx-bc35e.appspot.com", fullPath);
        Credentials credentials = GoogleCredentials.fromStream(new FileInputStream(firebasePropsPath));
        Storage storage = StorageOptions.newBuilder().setCredentials(credentials).build().getService();
        return storage.delete(blobId);
    }
}
