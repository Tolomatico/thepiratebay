
export class InputManager {
    keysPressed:string[]=[]


    
    constructor() {
        window.addEventListener("keydown",(event:KeyboardEvent)=>{
            this.isKeyPressed(event.code)
        })
        window.addEventListener("keyup",(event:KeyboardEvent)=>{
            this.isKeyReleased(event.code)
        })
    }

    isKeyPressed(key:string){
        key=key.toLowerCase().replace("key","")
        switch (key) {
            case "w":
                if (!this.keysPressed.includes("w")) this.keysPressed.push("w")
                break;
            case "s":
                if (!this.keysPressed.includes("s")) this.keysPressed.push("s")
                break;
            case "a":
                if (!this.keysPressed.includes("a")) this.keysPressed.push("a")
                break;
            case "d":
                if (!this.keysPressed.includes("d")) this.keysPressed.push("d")
                break;
            case "space":              
                if (!this.keysPressed.includes("space")) this.keysPressed.push("space")
                break;
            case "q":              
                if (!this.keysPressed.includes("q")) this.keysPressed.push("q")
                break;
            case "e":              
                if (!this.keysPressed.includes("e")) this.keysPressed.push("e")
                break;
            default:
                break;
        }
    }

    isKeyReleased(key:string){
        key=key.toLowerCase().replace("key","")
        switch (key) {
            case "w":
                this.keysPressed = this.keysPressed.filter(k => k !== "w")
                break;
            case "s":
                this.keysPressed = this.keysPressed.filter(k => k !== "s")
                break;
            case "a":
                this.keysPressed = this.keysPressed.filter(k => k !== "a")
                break;
            case "d":
                this.keysPressed = this.keysPressed.filter(k => k !== "d")
                break;
            case "space":
                this.keysPressed = this.keysPressed.filter(k => k !== "space")
                break;
            case "q":
                this.keysPressed = this.keysPressed.filter(k => k !== "q")
                break;
            case "e":
                this.keysPressed = this.keysPressed.filter(k => k !== "e")
                break;
            default:
                break;
        }
    }
}