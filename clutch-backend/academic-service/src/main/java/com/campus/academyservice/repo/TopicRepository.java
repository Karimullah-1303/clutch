package com.campus.academyservice.repo;

import com.campus.academyservice.entity.Topic;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface TopicRepository extends JpaRepository<Topic, UUID> {
    List<Topic> findByModuleIdOrderByTopicNumberAsc(UUID moduleId);

    @Query("SELECT COUNT(t) FROM Topic t WHERE t.moduleId IN " +
            "(SELECT m.id FROM Module m WHERE m.subjectCode = :subjectCode)")
    int countBySubjectCode(@Param("subjectCode") String subjectCode);


    @Query("SELECT t FROM Topic t WHERE t.moduleId IN (SELECT m.id FROM Module m WHERE m.subjectCode = :subjectCode) ORDER BY t.targetLectureNumber ASC")
    List<Topic> findAllBySubjectCodeOrderedByTargetLecture(@Param("subjectCode") String subjectCode);

}