FROM maven:3.9-eclipse-temurin-22 AS build
WORKDIR /app
COPY backend/pom.xml .
RUN mvn dependency:go-offline -B
COPY backend/src ./src
RUN mvn clean package -DskipTests -B

FROM eclipse-temurin:22-jre-alpine
WORKDIR /app
COPY --from=build /app/target/innovation-hub-api-1.0.0.jar app.jar
EXPOSE 8080
CMD ["java", "-jar", "app.jar"]
