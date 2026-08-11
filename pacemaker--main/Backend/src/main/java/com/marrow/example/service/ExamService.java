package com.marrow.example.service;

import java.util.List;
import com.marrow.example.exception.ResourceNotFoundException;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.marrow.example.dto.ExamRequest;
import com.marrow.example.entity.Exam;
import com.marrow.example.entity.Question;
import com.marrow.example.repository.ExamRepository;
import com.marrow.example.repository.QuestionRepository;

@Service
public class ExamService {

    private final ExamRepository examRepository;
    private final QuestionRepository questionRepository;

    public ExamService(
            ExamRepository examRepository,
            QuestionRepository questionRepository) {
        this.examRepository = examRepository;
        this.questionRepository = questionRepository;
    }

    @Transactional
    public Exam createExam(ExamRequest request) {
        List<Question> questions = questionRepository.findAllById(request.getQuestionIds());

        Exam exam = Exam.builder()
                .examTitle(request.getExamTitle())
                .questions(questions)
                .timeLimitMinutes(request.getTimeLimitMinutes())
                .totalMarks(request.getTotalMarks())
                .createdBy(request.getCreatedBy())
                .build();

        return examRepository.save(exam);
    }

    @Transactional
    public Exam updateExam(Long id, ExamRequest request) {
        Exam exam = getExamById(id);
        List<Question> questions = questionRepository.findAllById(request.getQuestionIds());

        exam.setExamTitle(request.getExamTitle());
        exam.setQuestions(questions);
        exam.setTimeLimitMinutes(request.getTimeLimitMinutes());
        exam.setTotalMarks(request.getTotalMarks());
        exam.setCreatedBy(request.getCreatedBy());

        return examRepository.save(exam);
    }

    @Transactional
    public void deleteExam(Long id) {
        Exam exam = getExamById(id);
        examRepository.delete(exam);
    }

    public List<Exam> getAllExams() {
        return examRepository.findAll();
    }

    public Exam getExamById(Long id) {
        return examRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Exam Not Found"));
    }
}