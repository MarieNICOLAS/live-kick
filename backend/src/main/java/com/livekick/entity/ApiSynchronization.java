package com.livekick.entity;

import com.livekick.entity.enums.SynchronizationStatus;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Entity
@Table(name = "api_synchronization")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ApiSynchronization {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_synchronization")
    private Long id;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "synchronization_status", nullable = false, length = 40)
    private SynchronizationStatus synchronizationStatus;

    @NotNull
    @Column(name = "started_at", nullable = false)
    private Instant startedAt;

    @Column(name = "ended_at")
    private Instant endedAt;

    @Size(max = 1000)
    @Column(name = "message", length = 1000)
    private String message;

    @NotNull
    @Column(name = "records_processed", nullable = false)
    private Integer recordsProcessed;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_data_source", nullable = false)
    private DataSource dataSource;
}