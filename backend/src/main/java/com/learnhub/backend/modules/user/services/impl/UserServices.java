package com.learnhub.backend.modules.user.services.impl;

import org.springframework.dao.DataAccessException;
import org.springframework.stereotype.Service;

import com.learnhub.backend.modules.user.dtos.LoginReponse;
import com.learnhub.backend.modules.user.dtos.LoginRequest;
import com.learnhub.backend.modules.user.dtos.userDTO;
import com.learnhub.backend.modules.user.services.interfaces.UserServicesInterfaces;
import com.learnhub.backend.services.BaseServices;

@Service
public class UserServices extends BaseServices implements UserServicesInterfaces {
    @Override
    public LoginReponse login(LoginRequest request) {
        try {
            // String email = request.getEmail();
            // String password_hash = request.getPassword_hash();
            String token = "random_token";
            userDTO user = new userDTO(1L, "hau99082005@gmail.com");
            return new LoginReponse(token, user);

        } catch (DataAccessException e) {
            throw new RuntimeException("Error occurred while logging in", e);
        }
    }
}
