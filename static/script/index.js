/**
 * 自用Avalon桌游发号器
 */

var ref = new Wilddog("https://avalon.wilddogio.com/");

function avalon(){
	this.dom = {
		input_name : $("#int_name"),
		input_room : $("#int_room"),
		step1 : $('#step1'),
		step2 : $('#step2'),
		step3 : $('#step3')
	}
	this.database = {
		room : ref.child("room"),
		player : ref.child("player")
	}
}

avalon.prototype.init = function(){
	var _ = this;
	var name = _.name = $.cookie('player_name') || '';
	var room = _.room = $.cookie('player_room') || '';
	if(name){
		_.dom.input_name.val(name);
		_.dom.input_name.attr('disabled','disabled')
	}

	if(room){
		_.dom.input_room.val(room);
		_.dom.input_room.attr('disabled','disabled')
	}

	$("#sub_init").click(function(){
		var _name = _.name = _.dom.input_name.val(),
			_room = _.room = _.dom.input_room.val();

		if(!_name || !_room){
			alert('Please fill the form!')
			return;
		}

		_.database.room.child(_room).child('players').child(_name).update({
		    name : _name
		},function(){
			$.cookie('player_name',_name, { expires: 7, path: '/' });
			$.cookie('player_room',_room, { expires: 7, path: '/' });
		});

		_.enter_room();

	})


}

avalon.prototype.enter_room = function(){
	
	var _ = this;
	_.dom.step1.hide();
	_.dom.step2.show();
	
	_.dom.step2.find('h2').html(_.room+"号房间")

	_.player_list = new Vue({
		el: '#player_list',
		data: {
			players: {}
		}
	})

	_.role_list = new Vue({
		el: '#role_list',
		data: {
			roles: []
		}
	})

	_.my_role = new Vue({
		el: '#my_role',
		data: {
			my : '',
			see : []
		}
	})

	_.volt = new Vue({
		el: '#volt_list',
		data: {
			players : []
		}
	})

	_.volt_result = new Vue({
		el: '#volt_result',
		data: {
			result : ''
		}
	})

	_.database.room.child(_.room).on('value',function(snap){
		var _val = snap.val();
		_.players = _.player_list.players = _val.players;
		
		_.num = Object.keys(_.players).length;

		if(_val.status == 'playing'){
			_.dom.step2.hide();
			_.dom.step3.show();
			if(_.players[_.name].role){
				_.my_role.my = config.roles[_.players[_.name].role].name;
				var my_see = {
					name : "",
					players : ""
				},
				_see = config.roles[_.players[_.name].role].see;
				
				for(var i in _see){
					my_see.name += config.roles[_see[i]].name + ' ';
				}
				for(var player in _.players){
					for(var j in _see){
						if(_.players[player].role == _see[j]){
							my_see.players += player + ' ';
						}
					}
				}
				_.my_role.see = my_see;
			}
			if(_val.volt){
				if(_val.volt.players){
					_.volt.players = _val.volt.players;
				}else{
					$('#volt').removeClass('volting');
					$('#volt').html('参加投票');
					_.volt.players = [];
					$('#volt_result').hide();
				}
				if(_val.volt.result){
					var _r = _val.volt.result,
						_r_r = 0,
						_r_w = 0;
					
					for(var i in _r){
						if(_r[i]){
							_r_r++;
						}else{
							_r_w++
						}
					}
					_.volt_result.result = '成功:'+_r_r+' 失败:'+_r_w;
				}else{
					$('#volt_result').hide();
				}
				if(_val.volt.volting && _val.volt.volting == 'finish'){
					$('#volt_result').show();
					setTimeout(function(){
						_.database.room.child(_.room).child('volt').child('volting').set(null);
						_.database.room.child(_.room).child('volt').child('players').set(null);
						_.database.room.child(_.room).child('volt').child('result').set(null);
					},10000)
				}else{
					$('#volt_result').hide();
				}
			}

		}else{
			_.dom.step3.hide();
			_.dom.step2.show();
		}
		if(_val.hasOwnProperty('roles')){
			_.role_list.roles = _val.roles;
		}
	})
	
	
	$('#quit_room').click(function(){
		_.database.room.child(_.room).child('players').child(_.name).set(null,function(){
			$.removeCookie('player_room');
			location.reload()
		})
	})
	
	$('#start').click(function(){
		if(_.num < 5 || _.num > 10){
			alert('建议玩家人数为5-10人');return;
		}
		_.start();
	})

	$('#volt').click(function(){
		var obj = $(this);
		if(obj.hasClass('volting')){
			if(confirm('请确认所有参与者都投票完毕？')){
				_.database.room.child(_.room).child('volt').child('volting').set('finish');
			}
		}else{
			if(confirm('你是否参加投票？')){
				_.database.room.child(_.room).child('volt').child('volting').set('volting');
				$('.popup').show();
				obj.addClass('volting')
				obj.html('公开投票结果');
				_.database.room.child(_.room).child('volt').child('players').push(_.name);
			}
		}
	})
	$('#right').click(function(){
		if(confirm('投成功？')){
			_.database.room.child(_.room).child('volt').child('result').push(1);
			$('.popup').hide();
		}
	})
	$('#wrong').click(function(){
		if(confirm('投反对？')){
			_.database.room.child(_.room).child('volt').child('result').push(0);
			$('.popup').hide();
		}
	})
	$('#end_game').click(function(){
		var obj = $(this);
		if(confirm('确认结束游戏？')){
			_.database.room.child(_.room).child('roles').set(null);
			_.database.room.child(_.room).child('status').set(null);
			_.database.room.child(_.room).child('volt').child('players').set(null);
			_.database.room.child(_.room).child('volt').child('result').set(null);
			var _players = {};
			for(var i in _.players){
				_players[i] = {
					name : i
				}
			}
			_.database.room.child(_.room).child('players').set(_players);
		}
	})
}

avalon.prototype.start = function(){
	var _ = this;
		_roles = config.role_num[_.num];

	_.dom.step2.hide();
	_.dom.step3.show();

	_.database.room.child(_.room).child('status').set('playing')
	var role_name = [],
		players = _.players;

	for(var i in config.role_num[_.num]){
		role_name.push({
			name : config.roles[config.role_num[_.num][i]].name
		})
	}
	_.database.room.child(_.room).child('roles').set(role_name);
	

	var _players = {};
	var _length = _.num;
	var tmp_roles = []
	tmp_roles = tmp_roles.concat(_roles);

	for(var player in players){
		var _index = Math.ceil(Math.random()/(1/_length))-1,
			_role = tmp_roles[_index];

		_length--;
		_.database.room.child(_.room).child('players').child(player).set({
			name : player,
			role : _role
		});
		tmp_roles.splice(_index,1);
	}
}

$(document).ready(function(){
	var $a = new avalon();
	$a.init();
})