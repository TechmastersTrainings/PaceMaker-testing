package com.marrow.example.service;

import com.marrow.example.dto.RecordingResponseDto;
import com.marrow.example.entity.Recording;
import com.marrow.example.entity.Video;
import com.marrow.example.enums.JobStatus;
import com.marrow.example.enums.RecordingStatus;
import com.marrow.example.exception.ResourceNotFoundException;
import com.marrow.example.repository.RecordingRepository;
import com.marrow.example.util.RecordingUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.List;
import java.time.LocalDateTime;
import java.util.UUID;

import com.marrow.example.entity.LiveClass;
import com.marrow.example.repository.LiveClassRepository;

@Service
@RequiredArgsConstructor
@Slf4j
public class RecordingService {

    private final RecordingRepository recordingRepository;
    private final VideoLibraryService videoLibraryService;
    private final SchedulerService schedulerService;
    private final LiveClassRepository liveClassRepository;

    @Async
    public void fetchRecordingsAsync() {
        log.info("Starting asynchronous recording fetch and retry processing...");
        int processedCount = 0;
        try {
            // 1. Create Recording entries from completed live classes
            List<LiveClass> completedClasses = liveClassRepository.findAll().stream()
                .filter(lc -> lc.getClassDateTime() != null && lc.getClassDateTime().isBefore(LocalDateTime.now()))
                .toList();

            for (LiveClass lc : completedClasses) {
                String recordingTitle = "Live Recording: " + lc.getTitle();
                if (!recordingRepository.existsByRecordingId("LIVECLASS_" + lc.getId())) {
                    Recording rec = Recording.builder()
                        .recordingId("LIVECLASS_" + lc.getId())
                        .title(recordingTitle)
                        .recordingUrl(lc.getZoomJoinUrl() != null ? lc.getZoomJoinUrl() : "https://s3.amazonaws.com/marrow-live-recordings/" + UUID.randomUUID() + ".mp4")
                        .duration(3600)
                        .recordingStatus(RecordingStatus.PENDING)
                        .createdAt(LocalDateTime.now())
                        .build();
                    recordingRepository.save(rec);
                    log.info("Created recording entry for completed live class: {}", lc.getTitle());
                }
            }

            // 2. Process pending recordings
            List<Recording> pendingRecordings = recordingRepository.findByRecordingStatus(RecordingStatus.PENDING);

            for (Recording pendingRec : pendingRecordings) {
                log.info("Processing recording: {}", pendingRec.getRecordingId());
                pendingRec.setRecordingStatus(RecordingStatus.PROCESSING);
                recordingRepository.save(pendingRec);
                try {
                    Video video = videoLibraryService.createVideoFromRecording(pendingRec);
                    if (video != null) {
                        pendingRec.setVideo(video);
                        pendingRec.setRecordingStatus(RecordingStatus.COMPLETED);
                        recordingRepository.save(pendingRec);
                        processedCount++;
                    } else {
                        pendingRec.setRecordingStatus(RecordingStatus.FAILED);
                        recordingRepository.save(pendingRec);
                    }
                } catch (Exception ex) {
                    log.error("Failed to process recording {}: {}", pendingRec.getRecordingId(), ex.getMessage());
                    pendingRec.setRecordingStatus(RecordingStatus.FAILED);
                    recordingRepository.save(pendingRec);
                }
            }

            // 3. Retry failed recordings
            List<Recording> failedRecordings = recordingRepository.findByRecordingStatus(RecordingStatus.FAILED);

            for (Recording failedRec : failedRecordings) {
                log.info("Retrying failed recording: {}", failedRec.getRecordingId());
                failedRec.setRecordingStatus(RecordingStatus.PROCESSING);
                recordingRepository.save(failedRec);
                try {
                    Video video = videoLibraryService.createVideoFromRecording(failedRec);
                    if (video != null) {
                        failedRec.setVideo(video);
                        failedRec.setRecordingStatus(RecordingStatus.COMPLETED);
                        recordingRepository.save(failedRec);
                        processedCount++;
                    } else {
                        failedRec.setRecordingStatus(RecordingStatus.FAILED);
                        recordingRepository.save(failedRec);
                    }
                } catch (Exception ex) {
                    log.error("Retry failed for recording {}: {}", failedRec.getRecordingId(), ex.getMessage());
                    failedRec.setRecordingStatus(RecordingStatus.FAILED);
                    recordingRepository.save(failedRec);
                }
            }

            schedulerService.logJobExecution("Recording Scheduler", JobStatus.SUCCESS, processedCount, null);
            log.info("Successfully completed asynchronous recording fetch and retry. Processed {} total recordings.", processedCount);
        } catch (Exception e) {
            log.error("Recording fetch job failed: {}", e.getMessage(), e);
            schedulerService.logJobExecution("Recording Scheduler", JobStatus.FAILED, processedCount, e.getMessage());
        }
    }

    public RecordingResponseDto getRecordingStatus(String recordingId) {
        Recording recording = recordingRepository.findByRecordingId(recordingId)
                .orElseThrow(() -> new ResourceNotFoundException("Recording not found with ID: " + recordingId));
        return RecordingResponseDto.builder()
                .recordingId(recording.getRecordingId())
                .status(recording.getRecordingStatus().name())
                .title(recording.getTitle())
                .recordingUrl(recording.getRecordingUrl())
                .createdAt(recording.getCreatedAt())
                .build();
    }
}
