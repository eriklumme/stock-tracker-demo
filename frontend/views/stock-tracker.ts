import {LitElement, html, css, customElement, property, query} from 'lit-element';
import {render} from 'lit-html';
import * as StockService from  '../generated/StockService';
import '@vaadin/vaadin-grid';
import '@vaadin/vaadin-combo-box';
import '@vaadin/vaadin-button';
import '@vaadin/vaadin-ordered-layout';
import { registerStyles } from '@vaadin/vaadin-themable-mixin/register-styles.js';

registerStyles('vaadin-combo-box-item', css`
    .symbol { font-weight: bold }
    .name { font-size: 0.8rem }
`);

@customElement("stock-tracker")
export class StockTracker extends LitElement {

    render() {
        return html`
            <h1>StockTracker</h1>
            <vaadin-grid .items=${this.items}>
                <vaadin-grid-column path="symbol"></vaadin-grid-column>
                <vaadin-grid-column path="price"></vaadin-grid-column>
                <vaadin-grid-column .renderer=${this._renderPercentage} header="Percentage change"></vaadin-grid-column>
                <vaadin-grid-column text-align="end" .renderer=${this.removeButtonRenderer}></vaadin-grid-column>
            </vaadin-grid>
            <vaadin-horizontal-layout theme="spacing" style="align-items: baseline">
                <vaadin-combo-box 
                    @filter-changed=${this._onStockSearchStringChanged} 
                    .renderer=${this._renderSearchBoxItems}
                    id="stock-search" 
                    label="Search for a stock symbol"
                    item-label-path="symbol">
                </vaadin-combo-box>
                <vaadin-button theme="primary" @click=${this._onAddToList}>Add stock</vaadin-button>
            </vaadin-horizontal-layout>
        `;
    }

    static get styles() {
        return css`
        :host {
            display: flex;
            flex-flow: column;
            box-sizing: border-box;
            padding: var(--lumo-space-l);
        }
        .percentage {
            color: green;
            font-weight: bold;
        }
        .percentage.negative {
            color: red;
        }
        vaadin-combo-box {
            width: 300px;
        }
    `;
    }

    private stockAPIBaseUrl = 'https://financialmodelingprep.com/api/v3/quote/';

    private searchApiURL = 'https://financialmodelingprep.com/api/v3/search?query=<query>&exchange=NASDAQ';

    private removeButtonRenderer: Function = this._renderRemoveButton.bind(this);

    @query("#stock-search")
    private stockSearchBox: any;

    @property({ type: Array })
    private items = [];

    firstUpdated() {
        this._updateGrid();
    }

    _renderPercentage(root: any, _column: any, rowData: any) {
        let percentage = rowData.item.changesPercentage;
        let classString = percentage < 0 ? 'negative' : '';
        let prefix = percentage < 0 ? '' : '+';

        render(
            html`<span class="percentage ${classString}">${prefix}${percentage}%</span>`,
            root
        );
    }

    _renderSearchBoxItems(root: any, _comboBox: any, model: any) {
        render(
            html`
                <div class="search-box-item">
                    <div class="symbol">${model.item.symbol}</div>
                    <div class="name">${model.item.name}</div>
                </div>`,
            root
        )
    }

    _renderRemoveButton(root: any, _column: any, rowData: any) {
        render(
            html`<vaadin-button @click=${() => this._onRemoveFromList(rowData.item.symbol)}>Remove</vaadin-button>`,
            root
        );
    }

    _updateGrid() {
        StockService.getStocks().then(stocks => {

            let symbols = stocks.map(stock => stock.symbol).concat(',');
            let url = this.stockAPIBaseUrl + symbols;

            fetch(url)
                .then(result => result.json())
                .then(jsonItems => this.items = jsonItems);
        });
    }

    _onStockSearchStringChanged(filterEvent: any) {
        let searchString = filterEvent.detail.value;
        if (!searchString) {
            this.stockSearchBox.filteredItems  = [];
            return;
        }

        const url = this.searchApiURL.replace('<query>', searchString);

        fetch(url)
            .then(result => result.json())
            .then(jsonItems => this.stockSearchBox.filteredItems  = jsonItems);
    }

    _onAddToList() {
        let symbol = this.stockSearchBox.selectedItem?.symbol;

        if (symbol) {
            StockService.addStock({ symbol }).then(_ => this._updateGrid());
        }
    }

    _onRemoveFromList(symbol: string) {
        StockService.removeStock({ symbol }).then(_ => this._updateGrid());
    }
}