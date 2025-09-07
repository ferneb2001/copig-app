*       ÖÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄ·
*       º                                                         º
*       º    A Program to Convert 1.xx compatible resources to    º
*       º    2.0 compatible resources.                            º 
*       º                                                         º 
*       ÓÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄ½
*    

set talk off
set safety off
set resource off
use sys(2005)
rev = ' '
browrev = chr(13)
set console off
set print on
set print to rsrcrev.txt
?? rev
set print off
set print to
set console on
thisrec = 1
origrecs = reccount()
do while thisrec <= origrecs
  	goto thisrec
  	cvt = at("2.0",type)
  	
*       ÖÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄ·
*       º                                                         º
*       º       Not yet converted -- see if we can convert it     º
*       º                                                         º 
*       ÓÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄ½
*    
	
  	if cvt = 0 
  	
*       ÖÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄ·
*       º                                                         º
*       º       It may already be a 2.0 Resource                  º
*       º                                                         º 
*       ÓÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄ½
    
    	if substr(data,1,2) == rev		
      		=domessage("Updating type")
      		mtype = alltrim(type) + "2.0"
      		replace type with mtype
      		
  		else					 
					
*       ÖÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄ·
*       º                                                         º
*       º       A Browse 2.0 format -- make it compatible.        º
*       º                                                         º 
*       ÓÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄ½
   
			if (id = "WINDBROW") and substr(data,1,1) == browrev
				=domessage("Adding version number")
				mtype = alltrim(type) + "2.0"
				replace type with mtype
				copy file rsrcrev.txt to rsrcdata.mem
	      		copy memo data to rsrcdata.mem additive
	      		append memo data from rsrcdata.mem overwrite 
	      		           
*       ÖÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄ·
*       º                                                         º
*       º       Is it a Convertible 1.02 Resource?                º
*       º                                                         º 
*       ÓÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄ½
			         
			else						
				if oktoconvert()
				
*       ÖÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄ·
*       º                                                         º
*       º       Reset the record pointer after locate.            º
*       º                                                         º 
*       ÓÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄ½
							
					goto thisrec		 
  			   	   	=domessage("Copying & reformatting data")
  			   	   	mtype = alltrim(type) + "2.0"
					copy file rsrcrev.txt to rsrcdata.mem
		    	    copy memo data to rsrcdata.mem additive
					scatter to temp
					temp(1) = mtype
					append blank
					gather from temp        	   
			        append memo data from rsrcdata.mem overwrite           
    			endif
			endif
		endif
	endif	    
    thisrec = thisrec + 1
enddo
use
set resource on
erase rsrcdata.mem
erase rsrcrev.txt
set talk on
set safety on

*       ÖÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄ·
*       º                                                         º
*       º  Function to print a message when a resource is being   º
*       º  converted.                                             º 
*       º                                                         º 
*       ÓÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄ½

function domessage
parameter msg

? msg + ' for ' + alltrim(id)
if alltrim(name) > ' '
    ?? ' Name ' + alltrim(name)
endif
return 1

*       ÖÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄ·
*       º                                                         º
*       º  Function to determine convertibity of a resource       º
*       º  in the FoxUser file.                                   º 
*       º                                                         º 
*       ÓÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄ½

FUNCTION oktoconvert
if (id = "CALCULATOR" or;
	id = "COLORSET" or;
   	id = "PUZZLE" or;
	id = "WINDMODIFY" or;
  	id = "WINDMEMO" or;
	id = "LBLLAYOUT")
		mid = id
		mtype = alltrim(type) + "2.0"
		mname = name
		locate for id = mid and type = mtype and name = mname
		if found()
			return .F.
		else
			return .T.
		endif
endif
RETURN .F.
 