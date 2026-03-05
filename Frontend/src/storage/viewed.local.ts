/* eslint-disable @typescript-eslint/no-unused-vars */
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Product } from "../models/product.model";

const VIEWED_KEY = "viewed_products";
const MAX_VIEWED = 15;

export const viewedLocal = {
    async add(product: Product) {
        try {
            const json = await AsyncStorage.getItem(VIEWED_KEY);
            let viewed: Product[] = json ? JSON.parse(json) : [];
            
            viewed = viewed.filter(p => p.id !== product.id);
            viewed.unshift(product);
            
            if (viewed.length > MAX_VIEWED) viewed.pop();
            
            await AsyncStorage.setItem(VIEWED_KEY, JSON.stringify(viewed));
        } catch (error) {
            console.log("Lỗi lưu sản phẩm đã xem", error);
        }
    },

    async get(): Promise<Product[]> {
        try {
            const json = await AsyncStorage.getItem(VIEWED_KEY);
            return json ? JSON.parse(json) : [];
        } catch (error) {
            return [];
        }
    }
};