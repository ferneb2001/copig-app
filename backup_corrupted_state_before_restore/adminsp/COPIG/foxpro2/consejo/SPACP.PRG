procedure spacp
*consulta de profesionales
@04,01 clear to 23,78
@04,28 say 'CONSULTA DE PROFESIONALES'
wmatric=0
wcatego=space(2)
wdctoti=0
wdctonr=0
wsigue='S'
@06,01 say 'MATRICULA       CATEGORIA    '
@06,30 say 'NOMBRE: '
do while wsigue='S'
	wocat=1
	@22,10 get wocat pict '@*H \<Ingenieros-Ge¢logos;\<T‚cnicos y otros;\<Dados de Baja' size 1,1
	read
	if wocat<1 or wocat>3
		wsigue='N'
	endif
   wop=1
   @23,15 get wop pict '@*H \<Salir;\<Por Nombre;\<Por Matricula;\<Por Dcto';
       size 1,1 
   read
   @23,01 clear to 23,78
   if wop=1
      wsigue='N'
   else   
      if wop=2
         wnom=space(30)
         @06,30 say 'NOMBRE: '
         @23,01 say 'Indique el nombre del profesional'
         @06,38 get wnom pict '@X'
         read
         if wocat=1
	         SELECT 1 
    	     use spprof index spprofn.idx
        	 define window pnom from 08,05 to 22,75
	         activate window pnom
    	     brow all for nombre =rtrim(wnom) in pnom NOEDIT
        	 deactivate window pnom 
	         wkey=str(dctipo,1)+str(dcnro,8)
    	     select 2 
        	 use spmatri index spmatdo.idx
	         locate for wkey=str(dctipo,1)+str(dcnro,8)
    	     do while found()
        	    do ver
	            select 2 
    	        continue
        	 enddo
         else
           if wocat=2
	         SELECT 1 
    	     use spprob index spprobn.idx
        	 define window pnom from 08,05 to 22,75
	         activate window pnom
    	     brow all for nombre =rtrim(wnom) in pnom NOEDIT
        	 deactivate window pnom 
	         wkey=str(dctipo,1)+str(dcnro,8)
    	     select 2 
        	 use spmatrb index spmatdb.idx
	         locate for wkey=str(dctipo,1)+str(dcnro,8)
    	     do while found()
        	    do ver
	            select 2 
    	        continue
        	 enddo
        	else
	         SELECT 1 
    	     use svprof index svprofn.idx
        	 define window pnom from 08,05 to 22,75
	         activate window pnom
    	     brow all for nombre =rtrim(wnom) in pnom NOEDIT
        	 deactivate window pnom 
	         wkey=str(dctipo,1)+str(dcnro,8)
    	     select 2 
        	 use svmatri index svmatdo.idx
	         locate for wkey=str(dctipo,1)+str(dcnro,8)
    	     do while found()
        	    do ver
	            select 2 
    	        continue
        	 enddo
        	endif 
         endif 	 
      else
         if wop= 3
            @06,01 say 'MATRICULA       CATEGORIA    '
            @23,01 say 'Indique el nro.de matricula y categoria o <ESC> para salir'  
            @06,11 get wmatric pict '99999'
            read
            @23,01 clear to 23,78
            if lastkey()<>27
               @06,27 get wcatego pict '!!'
               read
               wkey2=str(wmatric,5)+wcatego
               if wocat=1
	               select 2 
    	           use spmatri index spmatri
        	       seek(wkey2)
            	   if found()
                	  wkey=str(dctipo,1)+str(dcnro,8)
	                  select 1 
    	              use spprof index spprof
        	          seek(wkey)
            	      if found()
                	  else
	                     @06,38 say 'Sin datos personales'
    	              endif
        	          select 2   
            	      do ver
	               else
    	              @06,10 say 'Sin matr¡cula'   
        	       endif
        	    else
        	      if wocat=2
	               select 2 
    	           use spmatrb index spmatrb.idx
        	       seek(wkey2)
            	   if found()
                	  wkey=str(dctipo,1)+str(dcnro,8)
	                  select 1 
    	              use spprob index spprob.idx
        	          seek(wkey)
            	      if found()
                	  else
	                     @06,38 say 'Sin datos personales'
    	              endif
        	          select 2   
            	      do ver
	               else
    	              @06,10 say 'Sin matr¡cula'   
        	       endif
        	      else
	               select 2 
    	           use svmatri index svmatri.idx
        	       seek(wkey2)
            	   if found()
                	  wkey=str(dctipo,1)+str(dcnro,8)
	                  select 1 
    	              use svprof index svprof.idx
        	          seek(wkey)
            	      if found()
                	  else
	                     @06,38 say 'Sin datos personales'
    	              endif
        	          select 2   
            	      do ver
	               else
    	              @06,10 say 'Sin matr¡cula'   
        	       endif
        	      endif 
        	    endif   
            else
            endif
         else
            if wop= 4
               @07,01 say 'TIPO:    NUMERO:'
               @23,01 say 'Indique tipo y nro de documento o <ESC> para salir'
               @07,07 get wdctoti pict '9'
               read
               if lastkey()<>27
                  @07,18 get wdctonr pict '99999999'
                  read
                  wkey=str(wdctoti,1)+str(wdctonr,8)
                  if wocat=1
	                  select 2 
    	              use spmatri index spmatdo
        	          seek(wkey)
            	      if found()
                	     select 1
	                     use spprof index spprof
    	                 seek(wkey)
        	             if found()
            	            select 2
                	     else
                    	    @06,38 say 'Sin datos personales'
	                     endif   
    	                 do ver
        	          else
            	         @06,10 say 'Sin matr¡cula'
                	     read   
	                  endif
    	           else
    	              if wocat=2
	                 	 select 2 
	    	              use spmatrb index spmatdb.idx
    	    	          seek(wkey)
        	    	      if found()
            	    	     select 1
	            	         use spprob index spprob.idx
    	            	     seek(wkey)
        	            	 if found()
	            	            select 2
    	            	     else
        	            	    @06,38 say 'Sin datos personales'
	        	             endif   
    	        	         do ver
        	        	  else
            	        	 @06,10 say 'Sin matr¡cula'
	                	     read   
		                  endif
	                   else
		                  select 2 
    		              use svmatri index svmatdo.idx
        		          seek(wkey)
            		      if found()
                		     select 1
	                	     use svprof index svprof.idx
    	                	 seek(wkey)
	        	             if found()
    	        	            select 2
        	        	     else
            	        	    @06,38 say 'Sin datos personales'
	            	         endif   
	    	                 do ver
    	    	          else
        	    	         @06,10 say 'Sin matr¡cula'
            	    	     read   
	            	      endif
	                	endif 
	                endif  
               endif                 
            endif
         endif   
      endif          
   endif
enddo
@04,01 clear to 23,78
close all
return

procedure ver
*select 1
westado=space(20)
wkey2=str(numero,5)+catego
@06,11 say b.numero
@06,27 say b.catego
@06,38 say a.nombre
do panta01
*  se relaciona matri con titu para poner descrip.del titulo
select 3
use sptitu order titulo
select 2
set relation to titulo into sptitu            
wtitdesc=c.titdesc
wotorga=b.otorga
@08,19 say c.titulo
@08,23 say c.titdesc
@09,16 say b.otorga
@14,19 say b.inscr
@15,19 say b.fectit
@17,19 say b.pago
@18,19 say b.habili
@19,19 say b.vtohab
@20,19 say b.feccert
do case
	case b.condic='1'
		westado= 'Activo '
	case b.condic='2'
		westado= 'Carnet depositado '
	case b.condic='3'
		westado= 'Fallecido'
	case b.condic='4'
		westado= 'Baja/Reinscripcion'
	case b.condic='5'
		westado= 'Baja de Matricula'
	case b.condic='6'
		westado= 'Comunica Inactividad'
	case b.condic=' '
		westado= '       '
endcase
@22,02 say 'Estado: '
@22,21 say westado
if b.fectit <> {  /  /  }
   @21,19 say 'definitiva'
else
   @21,19 say 'provisoria'
endif
select 3
use spente order codigo
seek(b.otorga)
if found()
   wnoment=nombre
else
   wnoment=space(15)
endif
   @09,21 say wnoment                             
@23,01 say 'Oprima <ENTER> para ver datos personales'
read
do persona2 with wkey, wkey2
return