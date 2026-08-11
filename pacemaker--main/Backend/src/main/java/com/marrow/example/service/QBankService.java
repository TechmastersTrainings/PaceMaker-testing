package com.marrow.example.service;

import com.marrow.example.dto.PaginationResponseDto;
import com.marrow.example.dto.QuestionResponseDto;
import com.marrow.example.dto.QuestionRequestDto;
import com.marrow.example.entity.Question;
import com.marrow.example.entity.Subject;
import com.marrow.example.entity.Tag;
import com.marrow.example.enums.DifficultyLevel;
import com.marrow.example.repository.QuestionRepository;
import com.marrow.example.repository.SubjectRepository;
import com.marrow.example.specification.QuestionSpecification;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.ArrayList;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class QBankService {

    private final QuestionRepository questionRepository;
    private final SubjectRepository subjectRepository;

    @Transactional(readOnly = true)
    public PaginationResponseDto<QuestionResponseDto> getQuestions(String subject, String tag, String difficulty, Pageable pageable) {
        Specification<Question> spec = Specification.where(null);

        if (subject != null && !subject.isEmpty()) {
            spec = spec.and(QuestionSpecification.hasSubject(subject));
        }

        if (tag != null && !tag.isEmpty()) {
            spec = spec.and(QuestionSpecification.hasTag(tag));
        }

        if (difficulty != null && !difficulty.isEmpty()) {
            try {
                DifficultyLevel diffLevel = DifficultyLevel.valueOf(difficulty.toUpperCase());
                spec = spec.and(QuestionSpecification.hasDifficulty(diffLevel));
            } catch (IllegalArgumentException e) {
                // Invalid difficulty provided, ignoring or you can throw InvalidFilterException.
            }
        }

        Page<Question> questionPage = questionRepository.findAll(spec, pageable);

        return PaginationResponseDto.<QuestionResponseDto>builder()
                .content(questionPage.getContent().stream().map(this::mapToDto).collect(Collectors.toList()))
                .page(questionPage.getNumber())
                .size(questionPage.getSize())
                .totalElements(questionPage.getTotalElements())
                .totalPages(questionPage.getTotalPages())
                .build();
    }
    
    public PaginationResponseDto<QuestionResponseDto> getQuestionsBySubject(String subjectName, Pageable pageable) {
        return getQuestions(subjectName, null, null, pageable);
    }
    
    public PaginationResponseDto<QuestionResponseDto> getQuestionsByDifficulty(String difficulty, Pageable pageable) {
        return getQuestions(null, null, difficulty, pageable);
    }
    
    public PaginationResponseDto<QuestionResponseDto> getQuestionsByTag(String tagName, Pageable pageable) {
        return getQuestions(null, tagName, null, pageable);
    }

    @Transactional
    public QuestionResponseDto createQuestion(QuestionRequestDto dto) {
        Subject subject = subjectRepository.findBySubjectName(dto.getSubject())
                .orElseGet(() -> subjectRepository.save(Subject.builder().subjectName(dto.getSubject()).build()));

        DifficultyLevel difficulty = DifficultyLevel.MEDIUM;
        try {
            difficulty = DifficultyLevel.valueOf(dto.getDifficulty().toUpperCase());
        } catch (Exception e) {}

        String optA = dto.getOptions().getOrDefault("a", "");
        String optB = dto.getOptions().getOrDefault("b", "");
        String optC = dto.getOptions().getOrDefault("c", "");
        String optD = dto.getOptions().getOrDefault("d", "");
        String correct = dto.getCorrectOption() != null ? dto.getCorrectOption().toUpperCase() : "A";

        Question question = Question.builder()
                .questionText(dto.getQuestionText())
                .optionA(optA)
                .optionB(optB)
                .optionC(optC)
                .optionD(optD)
                .correctAnswer(correct)
                .explanation(dto.getExplanation())
                .difficulty(difficulty)
                .subject(subject)
                .topic(dto.getTopic())
                .build();

        Question saved = questionRepository.save(question);
        return mapToDto(saved);
    }

    @Transactional
    public QuestionResponseDto updateQuestion(Long id, QuestionRequestDto dto) {
        Question question = questionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Question not found with id: " + id));

        Subject subject = subjectRepository.findBySubjectName(dto.getSubject())
                .orElseGet(() -> subjectRepository.save(Subject.builder().subjectName(dto.getSubject()).build()));

        DifficultyLevel difficulty = DifficultyLevel.MEDIUM;
        try {
            difficulty = DifficultyLevel.valueOf(dto.getDifficulty().toUpperCase());
        } catch (Exception e) {}

        question.setQuestionText(dto.getQuestionText());
        question.setOptionA(dto.getOptions().getOrDefault("a", ""));
        question.setOptionB(dto.getOptions().getOrDefault("b", ""));
        question.setOptionC(dto.getOptions().getOrDefault("c", ""));
        question.setOptionD(dto.getOptions().getOrDefault("d", ""));
        question.setCorrectAnswer(dto.getCorrectOption() != null ? dto.getCorrectOption().toUpperCase() : "A");
        question.setExplanation(dto.getExplanation());
        question.setDifficulty(difficulty);
        question.setSubject(subject);
        question.setTopic(dto.getTopic());

        Question saved = questionRepository.save(question);
        return mapToDto(saved);
    }

    @Transactional
    public void deleteQuestion(Long id) {
        Question question = questionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Question not found with id: " + id));
        questionRepository.delete(question);
    }

    private QuestionResponseDto mapToDto(Question question) {
        List<String> options = new ArrayList<>();
        options.add(question.getOptionA());
        options.add(question.getOptionB());
        options.add(question.getOptionC());
        options.add(question.getOptionD());

        int correctOptIdx = 0;
        if (question.getCorrectAnswer() != null) {
            String correct = question.getCorrectAnswer().trim().toUpperCase();
            if (correct.equals("B") || correct.equals("1")) correctOptIdx = 1;
            else if (correct.equals("C") || correct.equals("2")) correctOptIdx = 2;
            else if (correct.equals("D") || correct.equals("3")) correctOptIdx = 3;
        }

        return QuestionResponseDto.builder()
                .id(question.getId())
                .questionText(question.getQuestionText())
                .difficulty(question.getDifficulty().name())
                .subject(question.getSubject().getSubjectName())
                .tags(question.getTags() != null ? question.getTags().stream().map(Tag::getTagName).collect(Collectors.toList()) : new ArrayList<>())
                .options(options)
                .correctOption(correctOptIdx)
                .explanation(question.getExplanation())
                .topic(question.getTopic())
                .build();
    }
}