import { InMemoryDbService } from 'angular-in-memory-web-api';

import { AssetData } from './asset/asset-data';
// import { ProductCategoryData } from './product-categories/product-category-data';
// import { SupplierData } from './suppliers/supplier-data';

export class AppData implements InMemoryDbService {

  createDb() {
    const assets = AssetData.assets;
    // const productCategories = ProductCategoryData.categories;
    // const suppliers = SupplierData.suppliers;
    return { assets };
    // return { products, productCategories, suppliers };
  }
}
