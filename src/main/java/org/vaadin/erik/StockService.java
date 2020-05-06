package org.vaadin.erik;

import com.vaadin.flow.server.connect.Endpoint;
import com.vaadin.flow.server.connect.auth.AnonymousAllowed;

import java.util.*;
import java.util.stream.Collectors;

@Endpoint
@AnonymousAllowed
public class StockService {

    private static final Set<Stock> stocks = new HashSet<>();

    static {
        Stock google = new Stock();
        google.setSymbol("GOOGL");
        stocks.add(google);

        Stock apple = new Stock();
        apple.setSymbol("AAPL");
        stocks.add(apple);
    }

    public List<Stock> getStocks() {
        return stocks.stream()
                .sorted(Comparator.comparing(Stock::getSymbol))
                .collect(Collectors.toList());
    }

    public void addStock(Stock stock) {
        stocks.add(stock);
    }

    public void removeStock(Stock stock) {
        synchronized (stocks) {
            stocks.removeIf(s -> Objects.equals(s.getSymbol(), stock.getSymbol()));
        }
    }
}