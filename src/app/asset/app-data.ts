import { InMemoryDbService } from 'angular-in-memory-web-api';

import { AssetData } from './asset-data';
// import { ProductCategoryData } from './product-categories/product-category-data';
// import { SupplierData } from './suppliers/supplier-data';

export class AppData implements InMemoryDbService {

  createDb() {
    const assets = AssetData.assets;
    let markets = [
      { id: 1, num: 41},
      { id: 2, num: 42}
    ]
    // const productCategories = ProductCategoryData.categories;
    // const suppliers = SupplierData.suppliers;
    return { assets, markets };
    // return { products, productCategories, suppliers };
  }
}
