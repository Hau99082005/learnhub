package com.learnhub.backend.modules.user.services.interfaces;

import com.learnhub.backend.modules.user.dtos.LoginReponse;
import com.learnhub.backend.modules.user.dtos.LoginRequest;
import com.learnhub.backend.modules.user.dtos.RegisterRequest;

public interface UserServicesInterfaces {
    LoginReponse login(LoginRequest request);

    LoginReponse register(RegisterRequest request);
}
