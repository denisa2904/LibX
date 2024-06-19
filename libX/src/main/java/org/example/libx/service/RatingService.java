package org.example.libx.service;

import jakarta.transaction.Transactional;
import org.example.libx.model.Rating;
import org.example.libx.helpers.RatingResponse;
import org.example.libx.repository.RatingRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@Transactional
public class RatingService {

    private final RatingRepo ratingRepo;

    @Autowired
    public RatingService(RatingRepo ratingRepo) {
        this.ratingRepo = ratingRepo;
    }

    public int addRating(Rating rating) {
        ratingRepo.save(rating);
        return 1;
    }

    public RatingResponse getAverageRating(UUID bookId){
        List<Rating> ratings = ratingRepo.findAllByBookId(bookId);
        double sum = 0;
        for(Rating r : ratings) {
            sum += r.getValue();
        }
        if(ratings.isEmpty())
            return new RatingResponse(0, 0);
        float result = (float) (sum / ratings.size());
        // make sure to round to 2 decimal places
        result = Math.round(result * 100.0) / 100.0f;
        return new RatingResponse(result, ratings.size());
    }

    public int getRatingByBookIdAndUserId(UUID bookId, UUID userId) {
        if(ratingRepo.findRatingByBookIdAndUserId(bookId, userId).isPresent()){
            return ratingRepo.findRatingByBookIdAndUserId(bookId, userId).get().getValue();
        }
        return 0;
    }

    public int updateRating(Rating rating){
        Optional<Rating> r = ratingRepo.findRatingByBookIdAndUserId(rating.getBook().getId(), rating.getUser().getId());
        if(r.isPresent()) {
            r.get().setValue(rating.getValue());
            ratingRepo.save(r.get());
            return 1;
        }
        return 0;
    }
}
