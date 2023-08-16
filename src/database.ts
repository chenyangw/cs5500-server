import * as fs from 'fs';
import * as path from 'path';
import User from './User';
import SheetMemory from './Engine/SheetMemory';


export class Database {
    private _users: Map<string, User>; // key: userId, value: User
    // private _userDirectory: string = path.join(__dirname, "documents");

    constructor() {
        this._users = new Map<string, User>();
    }

    public getUser(id: string): User | null{
        let user = this._users.get(id);
        if (user) {
            return user;
        } else {
            // throw new Error(`User ${id} not found`);
            return null;
        }    
    }

    // public getUserSheets(id: string): string[] {
    //     let user = this._users.get(id);
    //     if (user) {
    //         return Array.from(user.getAllSheetsMap().keys());
    //     } else {
    //         throw new Error(`User ${id} not found`);
    //     }
    // }

    public createUser(username:string, role:string): User {
        let user = new User(username, role);
        let userId = user.userId;
        this._users.set(userId, user);
        return user;
    }

    // public getAllSheetMap(): Map<string, SheetMemory>{

    //     let sheetsMap: Map<string, SheetMemory> = new Map<string, SheetMemory>();

    //     this._users.forEach((user: User) => {
    //         user.getAllSheetsMap().forEach((sheet: SheetMemory, key: string) => {
    //             sheetsMap.set(key, sheet);
    //         });
    //     });
    //     return sheetsMap;
    // }

    // public getSheetById(sheetId: string): SheetMemory{
    //     let foundSheet: SheetMemory | undefined;
    //     this._users.forEach((user: User) => {
    //         for(let key in user.sheets.keys()){
    //             if(key === sheetId){
    //                 let sheet = user.sheets.get(key);
    //                 if(sheet){
    //                     foundSheet = sheet;
    //                 }
    //             }
    //         }
    //     });
    //     if (foundSheet) {
    //         return foundSheet;
    //     } else {
    //         throw new Error(`Sheet ${sheetId} not found`);
    //     }
    // }

    // public deleteSheetById(sheetId: string): void{
    //     let foundSheet: SheetMemory | undefined;
    //     this._users.forEach((user: User) => {
    //         for(let key in user.sheets.keys()){
    //             if(key === sheetId){
    //                 let sheet = user.sheets.get(key);
    //                 if(sheet){
    //                     foundSheet = sheet;
    //                 }
    //             }
    //         }
    //     });
    //     if (foundSheet) {
    //         this._users.forEach((user: User) => {
    //             user.removeSheet(sheetId);
    //         });
    //     } else {
    //         throw new Error(`Sheet ${sheetId} not found`);
    //     }
    // }
}
    export default Database;