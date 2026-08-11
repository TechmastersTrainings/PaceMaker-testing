package com.marrow.example.repository;

import com.marrow.example.entity.VideoWatchHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface VideoWatchHistoryRepository extends JpaRepository<VideoWatchHistory, Long> {
    Optional<VideoWatchHistory> findByUserIdAndVideoId(Long userId, Long videoId);
    List<VideoWatchHistory> findByUserIdOrderByLastWatchedTimeDesc(Long userId);

    @Query("SELECT COUNT(w) FROM VideoWatchHistory w JOIN w.video v WHERE w.user.id = :userId AND v.category = :category AND w.completed = true")
    long countCompletedByUserAndCategory(@Param("userId") Long userId, @Param("category") com.marrow.example.enums.VideoCategory category);
}
