var SW = new SiriWave({
				width: window.innerWidth,
				height: window.innerHeight - 40,
				color: '#fff',
				frequency: 6,
				speed: 0.1,
				amplitude: 1,
				autostart: true,
			});
			['amplitude','speed','frequency'].forEach(function(p){
				document.getElementById(p).addEventListener('input', function(){
					document.getElementById(p+'-val').innerText = this.value;
					SW[p] = +this.value;
				});
			});