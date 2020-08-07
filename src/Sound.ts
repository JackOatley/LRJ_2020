export class Sound {

	static enabled:boolean = false;

	private count:number;
	private audioArray:Array<HTMLAudioElement>;

	constructor(src:string, count:number=1, volume:number=1) {
		this.count = count;
		this.audioArray = [];
		for (let n=0; n<count; n++) {
			const a = new Audio(src);
			a.volume = volume;
			this.audioArray.push(a);
		}
	}

	public play(loop:boolean=false) {
		if (!Sound.enabled) return;
		for (let n=0; n<this.count; n++) {
			const inst = this.audioArray[n];
			if (inst.paused) {
				inst.loop = loop;
				inst.play();
				return inst;
			}
		}
	}

}
