import * as fs from 'fs';
import * as path from 'path';
import SheetMemory from './Engine/SheetMemory';

/**
 * User class
 * 
 * @class User
 * @property {string} userId - unique generated id
 * @property {string} username - display name
 * @property {string} role - teacher | student
 * @property {Map<string, SheetMemory>} sheets - list of sheets
 * @property {string} documentDirectory - directory to store user's documents
 * */

class User{
    // userId: string, unique generated id
    // username: string, display name
    // role: string, teacher | student
    // sheets: list of sheets
    private _userId: string; 
    private _username: string;
    private _role: string;
    //private _sheets: Map<string, SheetMemory>;
    private _sheets: SheetMemory[];
    // private _documentDirectory: string = path.join(__dirname, "documents");


    constructor( username: string, role: string, userId?: string, sheets?: SheetMemory[]){
        this._userId = userId ? userId : this.generateUserId();

        if (username === "") {
            throw new Error("Username cannot be empty");
        } else {
            this._username = username;
        }

        this._role = role;
        this._sheets = sheets ? sheets : [];
        
    }

    //maybe changing this to a better one
    private generateUserId(): string{
        return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    }

    // use for generate new sheet id
    private generateRandomString(): string{
        return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    }

    // get functions
    public get userId(): string{
        return this._userId;
    }

    public get username(): string{
        return this._username;
    }

    public get role(): string{
        return this._role;
    }

    // public get sheets(): Map<string, SheetMemory>{
    //     return this._sheets;
    // }

    public get sheets(): SheetMemory[]{
        return this._sheets;
    }

    // set functions
    public set userId(userId: string){
        this._userId = userId;
    }

    public set username(username: string){
        this._username = username;
    }

    public set role(role: string){
        this._role = role;
    }

    // public set sheets(sheets: Map<string, SheetMemory>){
    //     this._sheets = sheets;
    // }

    public set sheets(sheets: SheetMemory[]){
        this._sheets = sheets;
    }

    public addSheet(sheet: SheetMemory){
        this._sheets.push(sheet);
    }

    /**
     * Get all sheets of a user
     * 
     * @returns {Map<string, SheetMemory>} - a map of sheets
     * */
    // public getAllSheetsMap(): Map<string, SheetMemory>{
    //     return this._sheets
    // }

    /**
     * Get all sheet ids of a user
     * 
     * @returns {string[]} - a list of sheet ids
     * */
    // public getSheetById(sheetId: string): SheetMemory | undefined{

    //     let sheet = this._sheets.get(sheetId);
    //     if(sheet){
    //         return sheet;
    //     }
    //     else {
    //         return undefined;
    //     }
    // }

    /**
     * Create a new sheet
     * 
     * @param {number} row - number of rows
     * @param {number} col - number of columns
     * @returns {SheetMemory} - a new sheet
     * */
    // public createSheet(row: number, col: number): SheetMemory{
    //     let sheetId = this.generateRandomString();
    //     this._sheets.set(sheetId, new SheetMemory(row, col));
    //     return this._sheets.get(sheetId)!;
    // }

    /**
     * Remove a sheet
     * 
     * @param {string} sheetId - id of the sheet
     * */
    // public removeSheet(sheetId: string): void{
    //     const keys = Array.from(this._sheets.keys());
    //     const index = keys.indexOf(sheetId);
    //     if (index !== -1) {
    //         keys.splice(index, 1);
    //         this._sheets.delete(sheetId);
    //     }
    // }
}

export default User;