package com.learnhub.backend.modules.user.services.interfaces;

import com.learnhub.backend.modules.user.dtos.FirebaseClientConfig;
import com.learnhub.backend.modules.user.dtos.GoogleAuthRequest;
import com.learnhub.backend.modules.user.dtos.LoginReponse;
import com.learnhub.backend.modules.user.dtos.LoginRequest;
import com.learnhub.backend.modules.user.dtos.RegisterRequest;
import com.learnhub.backend.modules.user.dtos.userDTO;
import com.learnhub.backend.modules.user.models.user;

public interface UserServicesInterfaces {
    LoginReponse login(LoginRequest request);

    LoginReponse register(RegisterRequest request);

    LoginReponse loginWithGoogle(GoogleAuthRequest request);

    FirebaseClientConfig firebaseClientConfig();

    userDTO me(String authorization);

    userDTO requireAdmin(String authorization);

    user requireAccount(String authorization);
}
