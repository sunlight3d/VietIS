package helpers;

import java.time.Instant;
import java.time.format.DateTimeFormatter;
import java.util.Date;

public class Utility {
    public static Date convertToDate(String isoString) {
        return Date.from(
                Instant.from(
                        DateTimeFormatter.ISO_INSTANT.parse(isoString)));
    }
}
