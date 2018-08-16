import * as React from "react";
import {
    Container,
    Header,
    Left,
    Body,
    Right,
    Button,
    Icon,
    Title,
    Content,
} from "native-base";
import { MarkdownEditor } from "react-native-markdown-editor";
import { StatusBar, View } from "react-native";

class EditorPage extends React.Component {
    constructor(props) {
        super(props);
        this.onTextChange = this.onTextChange.bind(this);

        this.state = {
            mdData: "",
        };
    }

    componentDidMount() {}

    onTextChange = text => {
        this.setState(
            {
                mdData: text,
            },
            () => {
                console.log(this.state);
            }
        );
    };

    render() {
        return (
            <Container style={{ flex: 1, marginTop: StatusBar.currentHeight }}>
                <StatusBar translucent={true} backgroundColor={"transparent"} />
                <Header>
                    <Left>
                        <Button transparent>
                            <Icon name="menu" />
                        </Button>
                    </Left>
                    <Body>
                        <Title>Editor</Title>
                    </Body>
                    <Right>
                        <Button transparent>
                            <Icon name="search" />
                        </Button>
                        <Button transparent>
                            <Icon name="heart" />
                        </Button>
                        <Button transparent>
                            <Icon name="more" />
                        </Button>
                    </Right>
                </Header>
                <MarkdownEditor
                    onMarkdownChange={text => {
                        this.onTextChange(text);
                    }}
                />
            </Container>
        );
    }
}

export default EditorPage;
