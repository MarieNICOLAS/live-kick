package com.livekick.dto;

import com.livekick.entity.enums.PlayerPosition;

import java.time.LocalDate;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PlayerDto {
    private Long id;
    private String firstName;
    private String lastName;
    private LocalDate birthDate;
    private PlayerPosition position;
    private Integer shirtNumber;
    private String photoUrl;
    private Long teamId;
}
