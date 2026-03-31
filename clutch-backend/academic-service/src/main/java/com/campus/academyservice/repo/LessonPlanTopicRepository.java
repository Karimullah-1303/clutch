package com.campus.academyservice.repo;

import com.campus.academyservice.entity.LessonPlanTopic;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface LessonPlanTopicRepository extends JpaRepository<LessonPlanTopic, UUID> {
    List<LessonPlanTopic> findByLessonPlanId(UUID lessonPlanId);
    Optional<LessonPlanTopic> findByLessonPlanIdAndTopicId(UUID lessonPlanId, UUID topicId);

    // 🚨 THE NEW GLOBAL AGGREGATOR QUERY 🚨
    @Query("SELECT DISTINCT lpt.topicId FROM LessonPlanTopic lpt " +
            "JOIN LessonPlan lp ON lpt.lessonPlanId = lp.id " +
            "WHERE lp.subjectCode = :subjectCode " +
            "AND lp.sectionName = :sectionName " +
            "AND lpt.coverageStatus = 'COMPLETED'")
    List<UUID> findHistoricallyCompletedTopicIds(
            @Param("subjectCode") String subjectCode,
            @Param("sectionName") String sectionName
    );


    @Query("SELECT DISTINCT lpt.topicId FROM LessonPlanTopic lpt " +
            "JOIN LessonPlan lp ON lpt.lessonPlanId = lp.id " +
            "WHERE lp.subjectCode = :subjectCode " +
            "AND lp.sectionName = :sectionName " +
            "AND lpt.coverageStatus = 'PUSHED' " +
            "AND lpt.topicId NOT IN (" +
            "   SELECT lpt2.topicId FROM LessonPlanTopic lpt2 " +
            "   JOIN LessonPlan lp2 ON lpt2.lessonPlanId = lp2.id " +
            "   WHERE lp2.subjectCode = :subjectCode " +
            "   AND lp2.sectionName = :sectionName " +
            "   AND lpt2.coverageStatus = 'COMPLETED'" +
            ")")
    List<UUID> findActiveCarryoverTopicIds(
            @Param("subjectCode") String subjectCode,
            @Param("sectionName") String sectionName
    );
}