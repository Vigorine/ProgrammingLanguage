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
    numbers: '0123456789'
}
Object.freeze(constants);

const TokenTypes = {
    INT: 'INT',
    FLOAT: 'FLOAT',
    PLUS: 'PLUS',
    MINUS: 'MINUS',
    MUL: 'MUL',
    DIV: 'DIV'
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
        this.line = 0;
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
    add(token) {
        this.tokens[this.line].push(token);
        if(token.value) this.tokensRaw[this.line].push(`${token.type}:${token.value}`);
        else this.tokensRaw[this.line].push(token.type);
    }

    /**
     * 
     * @param {Number} index 
     */
    remove(index) {
        this.tokens[this.line].splice(index, 1);
        this.tokensRaw[this.line].splice(index, 1);
    }

    adv() {
        this.line++;
        console.log(this.line)
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
     * @param {Array} lines
     */
    constructor(fn, lines) {
        this.fn = fn;
        this.lines = lines;
        this.tokens = new TokenList();
        this.currentChar = null;
        this.pos = -1;
        this.line = 0;
        this.advance();
    }

    advance() {
        this.pos++;
        if(this.pos < this.lines[this.line].length) this.currentChar = this.lines[this.line][this.pos];
        else this.currentChar = null;
        if(this.currentChar == null) {
            this.tokens.adv();
            this.adv();
        }
    }

    adv() {
        this.line++;
    }

    /**
     * 
     * @returns {TokenList}
     */
    start() {
        this.tokens.createLists(this.lines);
        while(this.currentChar != null) {
            if(constants.numbers.includes(this.currentChar)) {
                this.tokens.add(this.makeNumber());
            } else if(this.currentChar == '+') {
                this.tokens.add(new Token(TokenTypes.PLUS));
                this.advance();
            } else if(this.currentChar == '-') {
                this.tokens.add(new Token(TokenTypes.MINUS));
                this.advance();
            } else if(this.currentChar == '*') {
                this.tokens.add(new Token(TokenTypes.MUL));
                this.advance();
            } else if(this.currentChar == '/') {
                this.tokens.add(new Token(TokenTypes.DIV));
                this.advance();
            } else {
                this.advance();
            }

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
            var lines = val.split('\n');
            var lexer = new Lexer(path, lines);
            console.log(lexer.start().list());
        } else return new InvalidFileError(`File '${path}' could not be found!`).log();
    } else return new IllegalCommandError(`Command '${args[0]}' does not exist!`).log();
}

main(process.argv);