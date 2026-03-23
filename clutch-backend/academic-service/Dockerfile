# ==========================================
# STAGE 1: Build the Application
# ==========================================
# 🚨 UPGRADED TO JAVA 21 🚨
FROM maven:3.9.6-eclipse-temurin-21 AS build
WORKDIR /app

# Copy the pom.xml and download dependencies first (Caches them to speed up future builds!)
COPY pom.xml .
RUN mvn dependency:go-offline

# Copy the actual source code and build the .jar
COPY src ./src
RUN mvn clean package -DskipTests

# ==========================================
# STAGE 2: Run the Application (Minimal Image)
# ==========================================
# 🚨 UPGRADED TO JAVA 21 🚨
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Create a non-root user for security (Best Practice)
RUN addgroup -S spring && adduser -S spring -G spring
USER spring:spring

# Copy ONLY the built .jar file from Stage 1
COPY --from=build /app/target/*.jar app.jar

# Expose the port (Change this to 8081, 8082, or 8083 for your specific service)
EXPOSE 8082

# Run Java with strict memory limits to save your laptop's RAM!
ENTRYPOINT ["java", "-Xms128m", "-Xmx256m", "-jar", "app.jar"]