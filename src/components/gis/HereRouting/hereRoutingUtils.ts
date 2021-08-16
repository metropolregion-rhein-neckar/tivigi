export function getActionImageUrl(action: any): string {
    
    let imgBasePath = "tivigi/img/here_routing/";

    let result = imgBasePath;

    if (action.action == "arrive") {
        return result + "finish2.svg"
    }

    else if (action.action == "keep") {

        if (action.direction == "right") {
            return result + "keep-right.svg"
        }
        else if (action.direction == "left") {
            return result + "keep-left.svg"
        }

    }

    else if (action.action == "roundaboutExit") {
        return result + "roundabout.svg"
    }
    else if (action.action == "turn") {
        if (action.direction == "right") {
            return result + "right-turn.svg"
        }
        else if (action.direction == "left") {
            return result + "left-turn.svg"
        }
    }

    return "tivigi/img/here_routing/continue.svg";

}
