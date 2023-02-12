import { useRef, useState } from "react";
import { Segment, Transcript, OpenAiDictionary } from "utils/transcription";
import TranscriptView from "components/TranscriptView/TranscriptView";
import { LoadingStatus } from "components/App/App";
import { getClassNames } from "./AudioPlayer.classNames";
import { createTheme, DefaultButton, IScrollablePaneStyles, ITheme, Separator, Stack} from "@fluentui/react";
import { IStackTokens } from '@fluentui/react/lib/Stack';
import { mergeStyles } from '@fluentui/react/lib/Styling';
import React from "react";
import { getTheme, mergeStyleSets } from '@fluentui/react/lib/Styling';

interface IScrollablePaneExampleItem {
  color: string;
  text: string;
  index: number;
}
const theme = getTheme();
const ScrollBarclassNames = mergeStyleSets({
  wrapper: {
    height: '40vh',
    position: 'relative',
    maxHeight: 'inherit',
  },
  pane: {
    maxWidth: 400,
    border: '1px solid ' + theme.palette.neutralLight,
  },
  sticky: {
    color: theme.palette.neutralDark,
    padding: '5px 20px 5px 10px',
    fontSize: '13px',
    borderTop: '1px solid ' + theme.palette.black,
    borderBottom: '1px solid ' + theme.palette.black,
  },
  textContent: {
    padding: '15px 10px',
  },
});
const scrollablePaneStyles: Partial<IScrollablePaneStyles> = { root: ScrollBarclassNames.pane };
const colors = ['#eaeaea', '#dadada', '#d0d0d0', '#c8c8c8', '#a6a6a6', '#c7e0f4', '#71afe5', '#eff6fc', '#deecf9'];





interface AudioPlayerProps {
  src: string; 
  transcript: Transcript;
  transcriptLoadingStatus: LoadingStatus;
  fullTranscriptObject: OpenAiDictionary;
}

function AudioPlayer({
  src,
  transcript,
  transcriptLoadingStatus,
  fullTranscriptObject,
}: AudioPlayerProps) {
  const classNames = getClassNames();

  const audioRef = useRef<HTMLAudioElement>(null);
  const [currentSeconds, setCurrentSeconds] = useState(0);

  const handleTimeUpdate = () => {
    if (audioRef.current == null || transcript.length === 0) return;
    setCurrentSeconds(audioRef.current.currentTime);
  };

  const handleSetTime = (segment: Segment) => {
    if (!audioRef.current) return;
    const newTime = segment.offset / 1000;
    setCurrentSeconds(newTime);
    audioRef.current.currentTime = newTime;
  };
  
  // Azure OpenAI 
  const [check, setCheck] = useState("");

  function handleChange(event : React.ChangeEvent<HTMLInputElement>) {
    console.log(event.target.value);
    setMessage(event.target.value);
  }

  const [message, setMessage] = useState('');

  const [updated, setUpdated] = useState(message);


  const handleClick = async () => {
    // "message" stores input field value
    setUpdated(message);
    console.log("Final Message", message);

    var prompt = "Please answer the question from the below text \n###" + fullTranscriptObject.conversation + "\n###\n" + message + "\nAnswer:";
    prompt = encodeURIComponent(prompt);

    const { text } = await( await fetch(`/api/QueryOpenAI?prompt=${prompt}`)).json();

    setCheck(text)
  
  };

  const stackTokens: IStackTokens = { childrenGap: 12 };

  const theme: ITheme = createTheme({
    fonts: {
      small: {
        fontFamily: 'Segoe UI',
        fontSize: '30px',
      },
    },
  });
  
  const verticalStyle = mergeStyles({
    height: '200px',
  });

  console.log("typeof", typeof(fullTranscriptObject.summary))
  console.log("my transcript", Object.keys(fullTranscriptObject).length !== 0, fullTranscriptObject)


  let oai;
  const style = {
    color: 'black',
  };
  const bulletStyle = {
    color: 'black',
  };

  let ner;
  let key_items;
  let topics;
  let relatedConversations;
  let hoverCardText: string;

  
  if (Object.keys(fullTranscriptObject).length !== 0)
  {
    //const loadMoreInfo = useBoolean(false);

    ner = fullTranscriptObject.ner.map(str => 
    <span style= {style}> 
      <b>{str.split(':')[0]}:</b> 
      <span style={style}> {str.split(':')[1]}<br/></span> 
    </span>);
    
    key_items = fullTranscriptObject.key_items.map(str => <span style= {bulletStyle}> <li>{str}</li></span>);
    topics = fullTranscriptObject.topic.map(str => <span style= {bulletStyle}> <li>{str.replace('-','')} </li></span>);
    relatedConversations = fullTranscriptObject.related.map((convers, i) => (
      <div className="relatedConv">
        <span><tr key={i}>
          <br/>
          <div className="filename">
            <b>
              <span style={{ color: '#264ebb', fontSize:'large' }}>Top {i+1} </span>
            <span style={{fontSize:'medium'}}>| {Math.round(convers.score* 100)}% 
            <span>  </span>
            <tr style={{fontSize:'small'}}>  Relevant</tr>
            </span>
            </b> <br/></div>

            
            <span style={{fontSize:'small', textAlign: 'center'}}>{convers.id.replace(".json", "")}<br/></span>

          <div className="timestamp"><b>Date: </b> {convers.timestamp}<br/></div>
          <div className="summary"><b style={{fontSize:'medium'}}>Summary: <br/></b> {convers.summary}</div>
          </tr></span>

        <Stack tokens={stackTokens}>
          <Separator theme={theme}></Separator>
        </Stack>
      </div>

  ))

    oai =<div className={'oaiinsightsRightPanel'}>
            <h3 style={{textAlign: "left", color: '#264ebb',marginBlockStart:'1em', marginBlockEnd:'0px'}}>Overall Sentiment:</h3>
            <div >
              {(() => {
                if (fullTranscriptObject.sentiment === 'Positive') {
                  return (
                    <h4 style={{ color: '#05b005', marginBlockStart:'0px',marginBlockEnd:'0px'}}>{fullTranscriptObject.sentiment}</h4>
                  )
                } else if (fullTranscriptObject.sentiment === 'Negative') {
                  return (
                    <h4 style={{ color: "red", marginBlockEnd:'0px'}}>{fullTranscriptObject.sentiment}</h4>
                  )
                } else {
                  return (
                    <h4 style={{ color: "black", marginBlockEnd:'0px'}}>{fullTranscriptObject.sentiment}</h4>
                  )}
              })()}
            <Separator theme={theme}></Separator>

            <h3 style={{textAlign: "left", color: '#264ebb'}}>Category: </h3>
            <span style={style}> {fullTranscriptObject.category}</span>
            <Separator theme={theme}></Separator>

            <h3 style={{textAlign: "left", color: '#264ebb'}}>Entities Recognized:</h3>
            {ner}
            <Separator theme={theme}></Separator>

            <h3 style={{textAlign: "left", color: '#264ebb'}}>Key discussion topics:</h3>
            {topics}
            <Separator theme={theme}></Separator>

            <h3 style={{textAlign: "left", color: '#264ebb'}}>Key Items:</h3>
            {key_items}
            <Separator theme={theme}></Separator>


            </div>

        </div>
       
  }

  return (
      <div>
        <div className="audioPlayerStyle">
          <audio
            ref={audioRef}
            controls
            autoPlay={transcriptLoadingStatus === "successful"}
            controlsList="nodownload"
            onContextMenu={(e) => e.preventDefault()}
            onTimeUpdate={handleTimeUpdate}
            src={src}
            className={classNames.audioPlayer}
          >
            Your browser does not support the audio element
          </audio>
        </div>
        <Stack horizontal horizontalAlign="space-evenly">
          <div className={'summarization'} >
            <h2 style={{textAlign: "center", color: '#264ebb'}}>Conversation Summary</h2>
              {fullTranscriptObject.summary}
              <br/>
            <Separator theme={theme}></Separator>
          </div>

          <Stack.Item className={verticalStyle}>
            <Separator vertical />
          </Stack.Item>
          
          <div className={'askMoreBox'} >
            <div><h2 style={{textAlign: "center", color: '#264ebb'}}> Find out more! Ask anything here:</h2></div>
            <Stack horizontal horizontalAlign="space-evenly" style={{ display: "flex"}}>
              <input name="openaiQuestion" style={{ width:"100%" }} placeholder="Type your question here..." onChange={handleChange} value={message}>
              </input>
              <DefaultButton text="Submit" onClick={handleClick}>Update</DefaultButton>
            </Stack>
            <Separator theme={theme}></Separator>
            <div>
              {check}
            </div>
          </div>
        </Stack>

        <Stack tokens={stackTokens}>
          <Separator theme={theme}></Separator>
        </Stack>

        <Stack horizontal horizontalAlign="space-evenly">
          <div style={{ display: "flex" , alignItems: 'left'}}>

            <div className={'leftHandPanel'}>
              <Stack><h2 style={{textAlign: "left", color: '#264ebb'}}>Transcription</h2></Stack>

                <TranscriptView
                  transcript={transcript}
                  loadingStatus={transcriptLoadingStatus}
                  currentSeconds={currentSeconds}
                  fullTranscriptObject={fullTranscriptObject} onSetTime={function (segment: Segment): void {
                    throw new Error("Function not implemented.");
                  } }
                />
            </div>
            <div className={'middlePanel'}>
              <Stack><h2 style={{textAlign: "center", color: '#264ebb'}}>Call Highlights</h2></Stack>
              <Stack className={'oaiinsightsRightPanel'}>
                {oai}
              </Stack>   
            </div>
            <div className={'rightHandPanel'}>
              <Stack><h2 style={{textAlign: "center", color: '#264ebb', marginBlockStart: "0px", marginBlockEnd: "6px"}}>Top 5 most relevant<br/>conversations</h2></Stack>
              <Stack> <div className="relatedConv">{relatedConversations}</div></Stack> 
            </div>
          </div>
        </Stack>
      </div>
  );
}

export default AudioPlayer;
function moment(arg0: Date) {
  throw new Error("Function not implemented.");
}

