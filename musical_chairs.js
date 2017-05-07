/*

	METAFIVE - Musical Chairs の PV のサビの部分の、それっぽいシミュレーション

*/

//--------------------------------------------------------------------------------
//■プレゼンテーション層　兼　アプリケーション層

var SpinningCharView = function(inputText, drawedAreaId, speedType, orderType) {
	this.inputChars = inputText.split('');
	this.len = this.inputChars.length;

	this.drawedAreaId = drawedAreaId;
	this.speedType = speedType;
	this.orderType = orderType;

	this.spinningChars = new SpinningCharCollection();

	this.timer1;
	this.timer2;
};

SpinningCharView.SPEED_TYPE = {
	SLOW: 1
	, NORMAL: 2
};
SpinningCharView.ORDER_TYPE = {
	ASC: 1
	, DESC: 2
};

SpinningCharView.prototype.drawText = function(callbackAtCompleted) {
	var msec1;
	var msec2;
	if (this.speedType === SpinningCharView.SPEED_TYPE.NORMAL) {
		msec1 = 20;
		msec2 = 60;
	}else{
		msec1 = 60;
		msec2 = 180;
	}

	var self = this;
	var isCompleteAddingAllChars = false;

	//文章の出力
	this.timer1 = setInterval(function() {
		var text = self.spinningChars.getText();
		self._drawReal(text);
		if (isCompleteAddingAllChars && self.spinningChars.isEnd()) {
			clearInterval(self.timer1);
			callbackAtCompleted();
		}
	}, msec1);

	//文字の追加
	var addedIndex = 0;
	if (this.orderType === SpinningCharView.ORDER_TYPE.ASC) {
		addedIndex = 0;
	}else{
		addedIndex = this.len - 1;
	}
	this.timer2 = setInterval(function() {
		var c = self.inputChars[addedIndex];
		if (self.orderType === SpinningCharView.ORDER_TYPE.ASC) {
			self.spinningChars.appendChar(c);
			addedIndex++;
			if (addedIndex === self.len) {
				clearInterval(self.timer2);
				isCompleteAddingAllChars = true;
			}
		}else{
			self.spinningChars.prependChar(c);
			addedIndex--;
			if (addedIndex < 0) {
				clearInterval(self.timer2);
				isCompleteAddingAllChars = true;
			}
		}
	}, msec2);
};

//DOMにアクセスするのはココだけ
SpinningCharView.prototype._drawReal = function(text) {
	document.getElementById(this.drawedAreaId).innerText = text;
//console.log(text);
};

SpinningCharView.prototype.clear = function() {
	clearInterval(this.timer1);
	clearInterval(this.timer2);
	this._drawReal('');
};


//--------------------------------------------------------------------------------
//■ドメインモデル　（ファーストクラスコレクション）

var SpinningCharCollection = function() {
	this.spinningChars = [];
};

SpinningCharCollection.prototype.appendChar = function(char) {
	this.spinningChars.push(new SpinningChar(char));
};

SpinningCharCollection.prototype.prependChar = function(char) {
	this.spinningChars.unshift(new SpinningChar(char));
};

SpinningCharCollection.prototype.isEnd = function() {
	var len = this.spinningChars.length;
	for (var i = 0; i < len; i++) {
		if (this.spinningChars[i].isEnd() === false) {
			return false;
		}
	}
	return true;
};

SpinningCharCollection.prototype.getText = function() {
	var text = '';
	var len = this.spinningChars.length;
	for (var i = 0; i < len; i++) {
		text += this.spinningChars[i].getChar();
	}
	return text;
};


//--------------------------------------------------------------------------------
//■ドメインモデル

var SpinningChar = function(targetChar) {
	this.targetChar = targetChar;

	var inits = ['-', '-', '-', '-', '-'];
	var marks1 = ['-', '!', '"', '#', '$', '%', '&', '\'', '(', ')', '*', '+', ',', '-', '.', '/', ':'];
	var marks2 = [';', '<', '=', '>', '?', '@', '[', '\\', ']', '^', '_', '`', '{', '|', '}', '~', ' '];
	var nums = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
	var chars1 = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
	var chars2 = ['H', 'I', 'J', 'K', 'L', 'M'];
	var chars3 = ['N', 'O', 'P', 'Q', 'R', 'S', 'T'];
	var chars4 = ['U', 'V', 'W', 'X', 'Y', 'Z'];

	if (chars1.indexOf(targetChar) >= 0) {
		this.chars = inits.concat(marks1).concat(chars4).concat(chars1);
	}else if (chars2.indexOf(targetChar) >= 0) {
		this.chars = inits.concat(chars3).concat(marks1).concat(chars2);
	}else if (chars3.indexOf(targetChar) >= 0) {
		this.chars = inits.concat(marks2).concat(chars2).concat(chars3);
	}else if (chars4.indexOf(targetChar) >= 0) {
		this.chars = inits.concat(chars1).concat(marks2).concat(chars4);
	}else if (marks1.indexOf(targetChar) >= 0) {
		this.chars = inits.concat(chars1).concat(chars4).concat(marks1);
	}else if (marks2.indexOf(targetChar) >= 0) {
		this.chars = inits.concat(chars2).concat(chars3).concat(marks2);
	}else{
		this.chars = inits.concat(marks1).concat(marks2).concat(nums);
	}
//console.log('[' + targetChar + '] -> ', this.chars);

	this.nextIndex = 0;
	this.isHit = false;
	this.loopCount = 0;
};

SpinningChar.prototype.isEnd = function() {
	return this.isHit;
};

SpinningChar.prototype.getChar = function() {
	if (this.isHit === true) {
		return this.targetChar;
	}else{
		var char = this.chars[this.nextIndex];
		if (char) {
			this.nextIndex++;
			if (char === this.targetChar) {
				if (this.targetChar === ' ') {
					this.isHit = true;
				}else if (this.getZeroOrOne() === 0) {
					this.isHit = true;
				}else{
					//1以上にするとその回数分,再周する (今はPVの挙動に合わせて再周しないことにしている)
					if (this.loopCount >= 0) {
						this.isHit = true;
					}else{
						this.loopCount++;
						//もう１周させる
						this.nextIndex = 0;
					}
				}
			}
			return char;
		}else{
			this.isHit = true;
			this.targetChar = '?';
			return '?';
		}
	}
};

SpinningChar.prototype.getZeroOrOne = function() {
	//0 <= Math.random() < 1
	//0 <= Math.random() * 2 < 2
	//Math.floor() 小数点以下を切り捨て
	//num は 0 or 1
	var num = Math.floor(Math.random() * 2);
	return num;
};

//--------------------------------------------------------------------------------
