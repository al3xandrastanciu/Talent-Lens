package com.alexandra.hr_platform.model.dto.request;

import com.alexandra.hr_platform.model.entity.enums.Role;
import lombok.Data;

@Data
public class RegisterRequest {
    private String firstName;
    private String lastName;
    private String email;
    private String password;
    private Role role;
}
