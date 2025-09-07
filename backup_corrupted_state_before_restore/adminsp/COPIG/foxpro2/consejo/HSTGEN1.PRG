procedure hstgen1
*agrega profesionales con cursos de postgrado en hstbase
wop=1
wope=1
whabili=' '
whab=1
wfecha={  /  /  }
set date to dmy
wfecha=date()
@04,01 clear to 23,78
@04,15 say 'CARGA  DE PROFESIONALES CON CURSOS DE PROST-GRADO'
*@06,15 get wope pict '@*V \Estructuras antis.;\<Seguridad e Hig.en Trabajo;\<Higiene y Seg.Ind.;\<Esp.Explot.Petrol.;\<Ing.Sanitaria;\<Todas' size 1,1
*read
@12,15 get whab pict '@*H \Habilitados;\<No Habilitados;\<Todos' size 1,1
read
if whab = 1
   whabili='S'
else
   if whab = 2
      whabili='N'
   else
      whabili=' '
   endif
endif            
@23,30 get wop pict '@*H \<Salir;\<Grabar ' size 1,1
read
if wop=2
   @12,24 SAY 'Aguarde...,voy a armar un archivo' color w/n*
   set exclusive on
   select 5
   use spdescur ORDER CURSO
   select 1
   use spcursos
   select 2
   use spmatri index spmatri
   select 3
   use spprof index spprof
   select 6
   use sptitu order titulo
   select 7
   use spente order codigo
   select 4
   use hstbaset
   set safety off 
   zap
   select 1
   go top
   do while not eof()
      wposcu=0
      if curso = 2 or curso=3 or curso=5
          wposcu = 1
          select 5
          seek(a.curso)
          if found()
             wnom=descrip
          else
             wnom=space(20)
          endif
          select 1      
      endif
      if wposcu = 1                  
         wkey=str(numero,5)+catego
         select 2
         seek(wkey)
         if found()
            wkey2=str(dctipo,1)+str(dcnro,8)
            wposit=0
            if whab = 1
               if habili > 1991 and condic < '2'
                  wposit=1
               endif   
            else
               if whab = 2
                  if habili < 1992 and condic < '2'
                     wposit=1
                  endif
               else
                  wposit = 1
               endif
            endif
            if wposit = 1
              if a.catego='A '
				select 6
				seek(a.titulo)
				if found()
					wnomtit=titdesc
				else
					wnomtit=space(30)
				endif
				select 7
				seek(spcursos.curotor)
				if found()
					wnoment=nombre
				else
					wnoment=space(30)
				endif        
                select 3
                seek(wkey2)
                if found()
                	wtdoc=space(3)
                	if b.dctipo=1
                		wtdoc='DU '
                	else
                		if b.dctipo=2
                			wtdoc='LE '
                		else
                			if b.dctipo=3
                				wtdoc='LC '
                			else
                				if b.dctipo=4
                					wtdoc='CI '
                				else
                					if b.dctipo=5
                						wtdoc='DE '
                					endif
                				endif
                			endif
                		endif
	               	endif
*    		       if dpto = 16 or dpto = 17 or dpto = 18
                   select 4
                   append blank
                   replace hstmatri with a.numero
                   replace hstcateg with a.catego
                   replace hsttitu1 with wnomtit
                   replace hsttitu2 with wnom
                   replace hsttdocu with wtdoc
                   replace hstdocum with str(b.dcnro,8)
                   replace hstente  with wnoment
                   replace hstapell with c.nombre
                endif
             endif   
               endif
            endif
*         endif     
      endif
      select 1
      skip
   enddo
endif   
@04,01 clear to 23,78
close all
return

