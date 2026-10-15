
import com.sun.net.httpserver.HttpServer;
import com.sun.net.httpserver.HttpExchange;
import java.io.*;
import java.net.*;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;

public class CafeServer {

    public static void main(String[] args) throws Exception {

        HttpServer server = HttpServer.create(
            new InetSocketAddress(8080), 0
        );

        server.createContext("/", exchange -> {
            String path = exchange.getRequestURI().getPath();

            if (path.equals("/")) {
                sendFile(exchange, "public/index.html", "text/html");
            } else if (path.equals("/style.css")) {
                sendFile(exchange, "public/style.css", "text/css");
            } else {
                sendResponse(exchange, "Page not found.", 404);
            }
        });

        server.createContext("/order", exchange -> {
            if (!exchange.getRequestMethod().equals("POST")) {
                sendResponse(exchange, "Please submit an order.", 405);
                return;
            }

            BufferedReader reader = new BufferedReader(
                new InputStreamReader(
                    exchange.getRequestBody(),
                    StandardCharsets.UTF_8
                )
            );

            String data = reader.readLine();

            String customer = "";
            String items = "";

            if (data != null) {
                String[] fields = data.split("&");

                for (String field : fields) {
                    String[] parts = field.split("=", 2);

                    if (parts.length == 2) {
                        if (parts[0].equals("customer")) {
                            customer = URLDecoder.decode(
                                parts[1], StandardCharsets.UTF_8
                            );
                        }

                        if (parts[0].equals("items")) {
                            items = URLDecoder.decode(
                                parts[1], StandardCharsets.UTF_8
                            );
                        }
                    }
                }
            }

            if (customer.trim().isEmpty() || items.isEmpty()) {
                sendResponse(exchange,
                    "Please enter your name and select an item.", 400);
                return;
            }

            int total = 0;
            StringBuilder bill = new StringBuilder();

            bill.append("BREW & BYTE CAFE\n");
            bill.append("====================\n");
            bill.append("Order confirmed for: ");
            bill.append(customer);
            bill.append("\n\n");

            String[] orderedItems = items.split(",");

            for (String item : orderedItems) {
                if (item.isEmpty()) {
                    continue;
                }

                String[] details = item.split(":");

                if (details.length != 2) {
                    continue;
                }

                String name = details[0];
                int quantity;

                try {
                    quantity = Integer.parseInt(details[1]);
                } catch (NumberFormatException e) {
                    continue;
                }

                int price = getPrice(name);

                if (price == 0 || quantity < 1 || quantity > 100) {
                    continue;
                }

                int amount = price * quantity;
                total = total + amount;

                bill.append(name)
                    .append(" x ")
                    .append(quantity)
                    .append(" = Rs. ")
                    .append(amount)
                    .append("\n");
            }

            if (total == 0) {
                sendResponse(exchange,
                    "Please select a valid menu item.", 400);
                return;
            }

            bill.append("\n--------------------\n");
            bill.append("TOTAL: Rs. ").append(total);
            bill.append("\nThank you for visiting!");

            sendResponse(exchange, bill.toString(), 200);
        });

        server.start();

        System.out.println("Brew & Byte Cafe is running!");
        System.out.println("Open http://localhost:8080");
    }

    public static int getPrice(String name) {

        if (name.equals("Coffee")) {
            return 100;
        } else if (name.equals("Cappuccino")) {
            return 150;
        } else if (name.equals("Tea")) {
            return 50;
        } else if (name.equals("Sandwich")) {
            return 120;
        } else if (name.equals("Brownie")) {
            return 80;
        }

        return 0;
    }

    public static void sendFile(
        HttpExchange exchange,
        String fileName,
        String contentType
    ) throws IOException {

        File file = new File(fileName);

        if (!file.exists()) {
            sendResponse(exchange,
                "File not found: " + fileName, 404);
            return;
        }

        byte[] data = Files.readAllBytes(file.toPath());

        exchange.getResponseHeaders().set(
            "Content-Type", contentType + "; charset=UTF-8"
        );

        exchange.sendResponseHeaders(200, data.length);
        exchange.getResponseBody().write(data);
        exchange.close();
    }

    public static void sendResponse(
        HttpExchange exchange,
        String message,
        int status
    ) throws IOException {

        byte[] data = message.getBytes(StandardCharsets.UTF_8);

        exchange.getResponseHeaders().set(
            "Content-Type", "text/plain; charset=UTF-8"
        );

        exchange.sendResponseHeaders(status, data.length);
        exchange.getResponseBody().write(data);
        exchange.close();
    }
}
