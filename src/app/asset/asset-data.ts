import { Asset } from './asset';
import { dateFieldName } from '@progress/kendo-angular-intl';

export class AssetData {

  static assets: Asset[] = [
    {
      id: 1,
      marketId: 1,
      facilityId: 1,
      tagId: 1,
      make: 'Ford',
      model: 'Mustang',
      statusId: 1,
      assetStatus: 'active'
    },
    {
      id: 2,
      marketId: 2,
      facilityId: 1,
      tagId: 1,
      make: 'Chevy',
      model: 'Malabu',
      statusId: 1,
      assetStatus: 'active'
    },
    {
      id: 3,
      marketId: 3,
      facilityId: 1,
      tagId: 1,
      make: 'Dodge',
      model: 'Charger',
      statusId: 1,
      assetStatus: 'active'
    },
    {
      id: 4,
      marketId: 4,
      facilityId: 1,
      tagId: 1,
      make: 'Dell',
      model: 'Inspiron',
      statusId: 1,
      assetStatus: 'active'
    },
    {
      id: 5,
      marketId: 5,
      facilityId: 1,
      tagId: 1,
      make: 'Lenovo',
      model: 'C7',
      statusId: 1,
      assetStatus: 'active'
    },
    {
      id: 6,
      marketId: 6,
      facilityId: 1,
      tagId: 1,
      make: 'Lenova',
      model: 'B-22-44',
      statusId: 1,
      assetStatus: 'active'
    },
    {
      id: 7,
      marketId: 7,
      facilityId: 1,
      tagId: 1,
      make: 'Logitech',
      model: 'Keyboard',
      statusId: 1,
      assetStatus: 'active'
    },
    {
      id: 8,
      marketId: 8,
      facilityId: 1,
      tagId: 1,
      make: 'Samsung',
      model: 'A-22',
      statusId: 1,
      assetStatus: 'active'
    },
  ];
}
