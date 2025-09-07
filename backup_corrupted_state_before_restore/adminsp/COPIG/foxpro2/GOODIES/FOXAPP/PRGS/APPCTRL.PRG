PARAMETERS vcoord, hcoord
PRIVATE vcoord,hcoord
SET COMPATIBLE OFF						

DEFINE WINDOW appctrl ;
	FROM vcoord, hcoord ;
	TO vcoord + 2,hcoord+72 ;
	FLOAT ;
	NOCLOSE ;
	SHADOW ;
	DOUBLE ;
	COLOR SCHEME 5

IF TYPE("ACT3") <> "U"
   RELEASE act3
ENDIF	
PUBLIC act3
act3 = 1

ACTIVATE WINDOW appctrl NOSHOW
@ 0,1 GET act3 ;
	PICTURE "@*HN \<Top;\<Prior;\<Next;\<Bottom;\<Search;\<Quit" ;
	SIZE 1,10,2 ;
	VALID appctrl1()

ACTIVATE WINDOW appctrl
RETURN
