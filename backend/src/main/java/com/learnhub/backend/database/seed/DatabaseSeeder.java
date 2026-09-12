package com.learnhub.backend.database.seed;

import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.learnhub.backend.modules.user.models.UserRole;
import com.learnhub.backend.modules.user.models.userCatalogue;
import com.learnhub.backend.modules.user.repositories.userCatalogueRepository;

@Component
public class DatabaseSeeder implements ApplicationRunner {
    private final userCatalogueRepository catalogues;

    public DatabaseSeeder(userCatalogueRepository catalogues) {
        this.catalogues = catalogues;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        for (UserRole role : UserRole.values()) {
            if (catalogues.existsByCanonical(role.getCanonical())) {
                continue;
            }
            userCatalogue catalogue = new userCatalogue();
            catalogue.setName(role.getLabel());
            catalogue.setCanonical(role.getCanonical());
            catalogue.setPublish(true);
            catalogues.save(catalogue);
        }
    }
}
