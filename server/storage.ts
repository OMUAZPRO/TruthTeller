import { users, type User, type InsertUser, Statement, InsertStatement, Source, InsertSource } from "@shared/schema";
import { VerifiedStatement } from "@shared/types";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Statement methods
  createStatement(statement: InsertStatement): Promise<Statement>;
  getStatement(id: number): Promise<Statement | undefined>;
  getAllStatements(): Promise<Statement[]>;
  searchStatements(query: string): Promise<Statement[]>;
  
  // Source methods
  createSource(source: InsertSource): Promise<Source>;
  getSourcesByStatementId(statementId: number): Promise<Source[]>;
  
  // Combined methods
  getVerifiedStatement(id: number): Promise<VerifiedStatement | undefined>;
  getAllVerifiedStatements(): Promise<VerifiedStatement[]>;
  searchVerifiedStatements(query: string): Promise<VerifiedStatement[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private statements: Map<number, Statement>;
  private sources: Map<number, Source>;
  private userCurrentId: number;
  private statementCurrentId: number;
  private sourceCurrentId: number;

  constructor() {
    this.users = new Map();
    this.statements = new Map();
    this.sources = new Map();
    this.userCurrentId = 1;
    this.statementCurrentId = 1;
    this.sourceCurrentId = 1;
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userCurrentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Statement methods
  async createStatement(insertStatement: InsertStatement): Promise<Statement> {
    const id = this.statementCurrentId++;
    // Ensure context and detailed_analysis are null when undefined
    const statement: Statement = { 
      ...insertStatement, 
      id, 
      context: insertStatement.context ?? null,
      detailed_analysis: insertStatement.detailed_analysis ?? null,
      verified_at: new Date() 
    };
    this.statements.set(id, statement);
    return statement;
  }

  async getStatement(id: number): Promise<Statement | undefined> {
    return this.statements.get(id);
  }

  async getAllStatements(): Promise<Statement[]> {
    return Array.from(this.statements.values())
      .sort((a, b) => b.verified_at.getTime() - a.verified_at.getTime());
  }

  async searchStatements(query: string): Promise<Statement[]> {
    const lowerQuery = query.toLowerCase();
    return Array.from(this.statements.values())
      .filter(statement => 
        statement.text.toLowerCase().includes(lowerQuery) || 
        (statement.context && statement.context.toLowerCase().includes(lowerQuery)) ||
        statement.explanation.toLowerCase().includes(lowerQuery)
      )
      .sort((a, b) => b.verified_at.getTime() - a.verified_at.getTime());
  }

  // Source methods
  async createSource(insertSource: InsertSource): Promise<Source> {
    const id = this.sourceCurrentId++;
    // Ensure url and year are null when undefined
    const source: Source = { 
      ...insertSource, 
      id,
      url: insertSource.url ?? null,
      year: insertSource.year ?? null
    };
    this.sources.set(id, source);
    return source;
  }

  async getSourcesByStatementId(statementId: number): Promise<Source[]> {
    return Array.from(this.sources.values())
      .filter(source => source.statement_id === statementId);
  }

  // Combined methods
  async getVerifiedStatement(id: number): Promise<VerifiedStatement | undefined> {
    const statement = await this.getStatement(id);
    if (!statement) return undefined;

    const sources = await this.getSourcesByStatementId(id);
    return { ...statement, sources };
  }

  async getAllVerifiedStatements(): Promise<VerifiedStatement[]> {
    const statements = await this.getAllStatements();
    return Promise.all(
      statements.map(async statement => {
        const sources = await this.getSourcesByStatementId(statement.id);
        return { ...statement, sources };
      })
    );
  }

  async searchVerifiedStatements(query: string): Promise<VerifiedStatement[]> {
    const statements = await this.searchStatements(query);
    return Promise.all(
      statements.map(async statement => {
        const sources = await this.getSourcesByStatementId(statement.id);
        return { ...statement, sources };
      })
    );
  }
}

export const storage = new MemStorage();
