const fs = require("fs");


class BasicError {
    constructor(name, details) {
        this.name = name;
        this.details = details;
    }


    log() {
        var result = `${this.name}: ${this.details}`;
        console.log(result);
    }
}

class IllegalCommandError extends BasicError {
    constructor(details) {
        super("Illegal Command", details);
    }
}

class InvalidFileError extends BasicError {
    constructor(details) {
        super("Invalid File", details);
    }
}

class InvalidSyntaxError extends BasicError {
    constructor(details) {
        super("Invalid Syntax", details);
    }
}

const constants = {
    numbers: '0123456789',
    letters: 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
}
Object.freeze(constants);

const TokenTypes = {
    INT: 'INT',
    FLOAT: 'FLOAT',
    PLUS: 'PLUS',
    MINUS: 'MINUS',
    MUL: 'MUL',
    DIV: 'DIV',
    STR: 'STR',
    FSTR: 'FSTR',
    VAR: 'VAR'
};
Object.freeze(TokenTypes);

class Token {
    /**
     * 
     * @param {TokenType} type 
     * @param {String|Number} value 
     */
    constructor(type, value) {
        this.type = type;
        if(value) this.value = value;
        else this.value = null;
    }
}

class TokenList {

    /**
     * @private
     */
    tokens = {};

    /**
     * @private
     */
    tokensRaw = {};

    constructor() {
        this.tokens = {};
        this.tokensRaw = {};
    }

    createLists(lines) {
        for(var i = 0, l = lines.length; i < l; i++) {
            this.tokens[i] = [];
            this.tokensRaw[i] = [];
        }
    }

    /**
     * 
     * @param {Token} token 
     */
    add(token, line) {
        this.tokens[line].push(token);
        if(token.value) this.tokensRaw[line].push(`${token.type}:${token.value}`);
        else this.tokensRaw[line].push(token.type);
    }

    /**
     * 
     * @param {Number} index 
     */
    remove(index, line) {
        this.tokens.splice(index, 1);
        this.tokensRaw.splice(index, 1);
    }

    listTokens() {
        return this.tokens;
    }

    list() {
        return this.tokensRaw;
    }

}

class Lexer {

    /**
     * 
     * @param {String} fn 
     * @param {String} data
     */
    constructor(fn, data) {
        this.fn = fn;
        this.data = data;
        this.tokens = new TokenList();
        this.currentChar = null;
        this.pos = -1;
        this.advance();
    }

    advance() {
        this.pos++;
        if(this.data[this.pos] == "\n") this.currentChar = null;
        else if(this.pos < this.data.length) this.currentChar = this.data[this.pos];
        else this.currentChar = null;
    }

    newline() {

    }

    /**
     * 
     * @returns {TokenList}
     */
    start() {
        var lines = this.data.split("\n");
        this.tokens.createLists(lines);
        for(var i = 0, l = lines.length; i < l; i++) {
            while(this.currentChar != null) {
                if(constants.numbers.includes(this.currentChar)) {
                    this.tokens.add(this.makeNumber(), i);
                } else if(this.currentChar == '"' || this.currentChar == "'"){
                    this.tokens.add(this.makeString(), i);
                } else if(this.currentChar == '+') {
                    this.tokens.add(new Token(TokenTypes.PLUS), i);
                    this.advance();
                } else if(this.currentChar == '-') {
                    this.tokens.add(new Token(TokenTypes.MINUS), i);
                    this.advance();
                } else if(this.currentChar == '*') {
                    this.tokens.add(new Token(TokenTypes.MUL), i);
                    this.advance();
                } else if(this.currentChar == '/') {
                    this.tokens.add(new Token(TokenTypes.DIV), i);
                    this.advance();
                } else {
                    this.advance();
                }
            }
            this.advance();
        }

        return this.tokens;
    }

    /**
     * 
     * @returns {Token}
     */
    makeNumber() {
        var num = ''
        var dotCount = 0;
        var digits = constants.numbers;
        digits += '.';

        while(this.currentChar != null && digits.includes(this.currentChar)) {
            if(this.currentChar == '.') {
                if(dotCount == 1) return new InvalidSyntaxError(`'${num}' expected float or int`).log()
                dotCount++;
                num += '.';
            } else num += this.currentChar;
            this.advance();
        }

        if(dotCount == 0) return new Token(TokenTypes.INT, parseInt(num));
        else return new Token(TokenTypes.FLOAT, parseFloat(num));
    }

    /**
     * 
     * @returns {Token}
     */
    makeString() {
        var str = `${this.currentChar}`;
        var begStr = this.currentChar;
        this.advance();
        console.log(str);
        console.log(begStr);


        while(this.currentChar != null && this.currentChar != begStr) {
            str += this.currentChar;
            this.advance();
        }
        str += this.currentChar;
        this.advance();
        return new Token(TokenTypes.STR, str);
        
    }

    makeVar() {

    }

}

/**
 * 
 * @param {Array} args
 */
function main(args) {
    args.shift();
    args.shift();
    if(args.length < 2) return console.log("Too few arguments!");

    if(args[0] == "compile") {
        var path = args[1];
        if(fs.existsSync(path)) {
            var val = fs.readFileSync(path, { encoding: 'utf-8' });
            var lexer = new Lexer(path, val);
            console.log(lexer.start().list());
        } else return new InvalidFileError(`File '${path}' could not be found!`).log();
    } else return new IllegalCommandError(`Command '${args[0]}' does not exist!`).log();
}

main(process.argv);