package com.learnhub.backend.config;

import org.flywaydb.core.Flyway;
import org.springframework.boot.flyway.autoconfigure.FlywayMigrationStrategy;
import org.springframework.stereotype.Component;

@Component
public class FlywayConfig implements FlywayMigrationStrategy {

	@Override
	public void migrate(Flyway flyway) {
		flyway.repair();
		flyway.migrate();
	}
}
