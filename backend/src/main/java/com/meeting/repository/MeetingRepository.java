package com.meeting.repository;

import com.meeting.model.Meeting;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface MeetingRepository extends JpaRepository<Meeting, UUID> {
    List<Meeting> findAllByOrderByCreatedAtDesc();

    List<Meeting> findAllByUser_IdOrderByCreatedAtDesc(UUID userId);

    java.util.Optional<Meeting> findByIdAndUser_Id(UUID id, UUID userId);

    boolean existsByIdAndUser_Id(UUID id, UUID userId);

    void deleteByIdAndUser_Id(UUID id, UUID userId);
}

