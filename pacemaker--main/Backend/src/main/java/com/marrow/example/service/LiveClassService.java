package com.marrow.example.service;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.marrow.example.dto.LiveClassRequest;
import com.marrow.example.entity.LiveClass;
import com.marrow.example.repository.LiveClassRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class LiveClassService {

    private final LiveClassRepository liveClassRepository;

    public LiveClass createLiveClass(LiveClassRequest request) {
        String meetingId = UUID.randomUUID().toString();
        String zoomJoinUrl = "https://zoom.us/j/" + meetingId;

        LiveClass liveClass = LiveClass.builder()
                .title(request.getTitle())
                .classDateTime(request.getClassDateTime())
                .zoomJoinUrl(zoomJoinUrl)
                .zoomMeetingId(meetingId)
                .trainerName(request.getTrainerName())
                .topic(request.getTopic())
                .description(request.getDescription())
                .autoRecord(request.getAutoRecord())
                .retentionDays(request.getRetentionDays())
                .build();

        return liveClassRepository.save(liveClass);
    }

    public LiveClass updateLiveClass(Long id, LiveClassRequest request) {
        LiveClass liveClass = liveClassRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Live class not found with id: " + id));
        
        liveClass.setTitle(request.getTitle());
        liveClass.setClassDateTime(request.getClassDateTime());
        liveClass.setTrainerName(request.getTrainerName());
        liveClass.setTopic(request.getTopic());
        liveClass.setDescription(request.getDescription());
        liveClass.setAutoRecord(request.getAutoRecord());
        liveClass.setRetentionDays(request.getRetentionDays());
        
        return liveClassRepository.save(liveClass);
    }

    public void deleteLiveClass(Long id) {
        LiveClass liveClass = liveClassRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Live class not found with id: " + id));
        liveClassRepository.delete(liveClass);
    }

    public List<LiveClass> getAllLiveClasses() {
        return liveClassRepository.findAll();
    }
}