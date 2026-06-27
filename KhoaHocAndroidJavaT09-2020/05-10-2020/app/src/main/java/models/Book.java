package models;

import org.json.JSONException;
import org.json.JSONObject;

import java.util.ArrayList;
import java.util.HashMap;

public class Book {
    private int id;
    private String imageUrl;
    private String name;
    private String author;
    private int rate;
    private String description;

    public Book(int id, String imageUrl, String name, String author, int rate, String description) {
        this.id = id;
        this.imageUrl = imageUrl == null ? "" : imageUrl;
        this.name = name == null ? "" : name;
        this.author = author == null ? "" : author;
        this.rate = rate;
        this.description = description == null ? "" : description;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }
    public static Book createBookFromJSonObject(JSONObject jsonObject) {
        try {
            return new Book(
                    jsonObject.getInt("id"),
                    jsonObject.getString("imageUrl"),
                    jsonObject.getString("name"),
                    jsonObject.getString("author"),
                    jsonObject.getInt("rate"),
                    jsonObject.getString("description")
            );
        }catch (JSONException jsonException) {
            return null;
        }


    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getAuthor() {
        return author;
    }

    public void setAuthor(String author) {
        this.author = author;
    }

    public int getRate() {
        return rate;
    }

    public void setRate(int rate) {
        this.rate = rate;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }
    public static ArrayList<Book> generateFakeBooks() {
        ArrayList<Book> books = new ArrayList<>();

        books.add(new Book(1,"" +
                "https://www.scotsman.com/images-e.jpimedia.uk/imagefetch/http://www.scotsman.com/webimage/Prestige.Item.1.74151213!image/image.jpg?crop=982:524,smart&width=990",
                "Lap trinh C", "Nguyen Van A", 3, "Day la quteb CCC"));
        books.add(new Book(2,"https://www.scotsman.com/images-e.jpimedia.uk/imagefetch/http://www.scotsman.com/webimage/1.4921349!image/image.jpg?&width=640",
                "Android Koptlin", "bu ge wlkds ", 1, "Day la quteb CCC"));
        books.add(new Book(3,"https://www.scotsman.com/images-e.jpimedia.uk/imagefetch/http://www.scotsman.com/webimage/1.4921351!image/image.jpg?&width=640","C# lap trinh", "Alelne", 3, "Day la quteb CCC"));
        books.add(new Book(4,"https://www.scotsman.com/images-e.jpimedia.uk/imagefetch/http://www.scotsman.com/webimage/1.4921351!image/image.jpg?&width=640","Kotlin", "Joe je", 5, "Day la quteb CCC"));
        books.add(new Book(5,"https://www.scotsman.com/images-e.jpimedia.uk/imagefetch/http://www.scotsman.com/webimage/1.4921351!image/image.jpg?&width=640","ReactJS", "rrttr", 3, "Day la quteb CCC"));
        books.add(new Book(6,"https://www.scotsman.com/images-e.jpimedia.uk/imagefetch/http://www.scotsman.com/webimage/1.4921351!image/image.jpg?&width=640","Flutter", "sewerw", 5, "Day la quteb CCC"));
        books.add(new Book(7,"https://www.scotsman.com/images-e.jpimedia.uk/imagefetch/http://www.scotsman.com/webimage/1.4921351!image/image.jpg?&width=640","Dotnet Core", "weere", 2, "Day la quteb CCC"));
        books.add(new Book(8,"https://www.scotsman.com/images-e.jpimedia.uk/imagefech/http://www.scotsman.com/webimage/1.4921351!image/image.jpg?&width=640","ios", "eeewwrwer", 1, "Day la quteb CCC"));
        return books;
    }
}
