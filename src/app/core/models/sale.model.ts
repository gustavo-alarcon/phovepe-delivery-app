import { User } from './user.model';
import { Product } from './product.model';

export interface Sale {
  id:string,
  payType?:string,
  correlative: number,
  location: {
    address: string,
    district: any,
    coord: {
      lat: number,
      lng: number,
    },
    reference: string,
    number:number
  },
  deliveryDate: Date,
  deliveryFinishedDate?: Date,
  createdAt: Date,
  createdBy: User,
  productList: {
    product: Product,
    quantity: number
  }[],
  status: string, //'Solicitado', 'Confirmado', 'En reparto', 'Entregado', 'Cancelado'
  total: number,
  deliveryPrice: number,

  confirmedProductList?: {      //Only for statuses COnfirmado, en reparto and Entregado
    product: Product,
    quantity: number,
    price: number,
    noRefQuantity: number       //Usado solo para ref==true. Se usa para designar a la cantidad real
  }[],
  confirmedAt?: Date,
  confirmedBy?: User,
  totalConfirmedPrice?: number,
  deliveryConfirmedPrice?: number

  dispatchedAt?: Date,
  dispatchedBy?: User,
  driver?: User

  cancelledAt?: Date,
  cancelledBy?: User

  rateData?: {
    serviceRate: number,
    productRate: number,
    observation?: string,
  }
}