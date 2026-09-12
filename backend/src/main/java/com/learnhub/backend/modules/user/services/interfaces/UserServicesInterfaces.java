package com.learnhub.backend.modules.user.services.interfaces;

import com.learnhub.backend.modules.user.dtos.LoginReponse;
import com.learnhub.backend.modules.user.dtos.LoginRequest;

public interface UserServicesInterfaces {

    public LoginReponse login(LoginRequest request);
    
}
