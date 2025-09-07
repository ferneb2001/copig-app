procedure asgrapad
*graba prof y matric asociados en sprof.
wop=1
wope=1
whabili=' '
whab=1
wpp=0
wfecha={  /  /  }
set date to dmy
wfecha=date()
@04,01 clear to 23,78
@04,15 say 'GRABA SENAL DE ASOCIADO EN SPPROF '
   @12,24 SAY 'Aguarde...,voy a armar un archivo' color w/n*
   set exclusive on
   select 1
   use spasocia order asociado
*  select 1
*  use spcursos
   select 2
   use spmatri index spmatdo
   select 3
   use spprof index spprof
*   select 4
*   use spprpdr index spprpdr
*   select 5 
*   use spmapdr index spmadpdr
   set safety off 
*   zap
   select 1
   go top
   do while not eof()
      wkey2=str(astipo,1)+str(asnro,8)
      select 3
      seek(wkey2)
      if found()
      	select 2
      	seek(wkey2)
      		if found()
      			if b.catego='A ' 
      				select 3
        			replace c.numasoc with a.asociado
       			 	replace c.feasoc  with a.asfeing
       			 	select 1
       			 	replace a.asmatri with b.numero
       			 	replace a.ascateg with b.catego
       			 	replace a.ashabil with b.habili
       			else
       				@23,1 say ' No existe en Cat A '
       				@23,50 say b.catego
       				@23,55 say c.numasoc
       				@23,70 get wpp pict '9'
       				read 	
       			endif
       		else
       			@23,1 say ' No encuentra en spmatri '
       			@23,30 say c.nombre		 
        	endif 
      else
        @23,1 say 'No encontrado en prof '
      	@23,60 say a.asociado
      	@23,70 get wpp pict '9'
      	read  	
      endif
      select 1
      skip
   enddo
@04,01 clear to 23,78
close all
return

