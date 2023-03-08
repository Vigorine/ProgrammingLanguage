class Lexer:

    def __init__(self, data):
        self.data = data
        self.tokens = []
        self.keywords = [
            'dump',
            'call',
            'end'
        ]
        self.operators = [
            
        ]

    def tokenizer(self):
        for loc in self.data:
            tmp = []
            tid = ''
            numbers = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"]

            for l in loc:
                if l == '"' and tid == '':
                    tid = 'string'
                    tmp = []
                elif l == '"' and tid == 'string':
                    self.tokens.append({'id': tid, 'value': ''.join(tmp)})
                    tid = ''
                    tmp = []
                elif l == '_' and tid == '':
                    tid = 'integer'
                    tmp = []
                elif l == '_' and tid == 'integer':
                    self.tokens.append({'id': tid, 'value': int(''.join(tmp))})
                    tid = ''
                    tmp = []
                elif l == ':':
                    self.tokens.append({'id': 'label', 'value': ''.join(tmp)})
                    tmp = []
                elif ''.join(tmp) in self.keywords:
                    self.tokens.append({'id': 'keyword', 'value': ''.join(tmp)})
                    tmp = []
                elif l == "\n":
                    if len(tmp) > 0:
                        self.tokens.append({'id': 'newline', 'value': ''.join(tmp)})
                        tmp = []
                elif (l == ' ' or l == "\t") and tid != 'string':
                    continue
                else:
                    tmp.append(l)