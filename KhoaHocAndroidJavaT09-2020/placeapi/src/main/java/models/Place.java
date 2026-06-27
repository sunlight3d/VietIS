package models;

import javax.persistence.*;

public class Place {
    @Id
    @GeneratedValue(strategy=GenerationType.AUTO)
    private Integer id;
    private String name;

    @Column(name = "imageUrl")
    private String imageUrl;
    public Place(String name, String imageUrl) {
        this.name = name;
        this.imageUrl = imageUrl;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }
}
/*
CREATE DATABASE KhoaHocAndroidJavaT092020;
USE KhoaHocAndroidJavaT092020;
create user 'student'@'%' identified by '123456';
grant all on KhoaHocAndroidJavaT092020.* to 'student'@'%';
CREATE TABLE Place(
id INT PRIMARY KEY AUTO_INCREMENT,
name VARCHAR(300) NOT NULL,
imageUrl VARCHAR(300) NOT NULL
);
* */