procedure spemail   
*parameter wkey
*actualizacion de datos de correo electronico
set exclusive off
wnom=space(30)
wkey=space(7)
wemail=SPACE(40)
wsigue='S'
@04,01 clear to 23,78
@04,25 say 'ACTUALIZACION DE CORREOS ELECTRONICOS '
do while wsigue='S'
   wop=3
   @05,01 clear to 23,78
   @06,02 say 'Matr¡cula'
   @06,20 say 'Categ.:'
   @23,15 get wop pict '@*H \Salir;\<Por nombre;Por \<Matricula' size 1,1
   read
   @23,01 clear to 23,78
   if wop=1
      wsigue='N'
   else
      if wop = 2
         wnom=space(30)
         @06,31get wnom pict '@!'
         read
         select 1
         use spprof inde spprofn
         define window pnom from 08,05 to 22,75
         activate window pnom
         brow fields nombre, spemail for nombre=rtrim(wnom) in pnom
         deactivate window pnom
         wkey=str(dctipo,1)+str(dcnro,8)
         wnombre=nombre
         select 2
         use spmatri index spmatdo
         locate for wkey=str(dctipo,1)+str(dcnro,8)
         do while found()
            wkey2=str(numero,5)+catego
            wmatric=numero
            wcatego=catego
            do proceder
            select 2
            continue
         enddo   
      else
         if wop=3 	
            wmatric=0
            @23,01 say 'Indique el Nro. de Matr¡cula o <esc> para salir'
            @06,13 get wmatric pict '99999'
            read
            @23,01 clear to 23,78
            wcatego=space(2)
            if lastkey()<>27
               @23,01 say 'Indique la Categor¡a'
               @06,28 get wcatego pict '!!'
               read
               wkey=str(wmatric,5)+wcatego
               select 2
               use spmatri index spmatri
               seek(wkey)
               if found()
                  wkey1=str(b.dctipo,1)+str(b.dcnro,8)
                  select 1
                  use spprof index spprof.idx, spprofn
                  seek(wkey1)
                  if found()
                     wnombre=nombre
                     do proceder
                  else
                     @07,31 say 'Sin datos personales'
                  endif
               else
                  @07,31 say 'No existe matricula'   
               endif   
            else
               @07,10 say 'Sin matricula '
            endif
         else
         endif
      endif
   endif
enddo
@04,01 clear to 23,78
close all
return

procedure proceder
              @08,01 say 'Domicilio        :'
              @12,01 say 'e-mail           :'
              @06,31 say wnombre
		      @06,13 say wmatric pict '99999'
		      @06,28 say wcatego
              select 1
              @08,21 say domici
              @12,01 say spemail
              westadi=0
              westadu=space(1)
              wop2=1
              @23,20 get wop2 picture '@*H \<Modificar;\<Salir';
                    size 1,1 
              read
              @23,01 clear to 23,78
              if wop2=2
                 @07,01 clear to 23,78
                 wsigue='N'
              else
                 if wop2=1
                    do modi
                 endif      
              endif
@07,01 clear to 23,78   
return

procedure modi
wdomici=domici
wlocali=locali
wdpto=dpto
wprovin=provin
wtelef=telef
wtipo=tipo
wcelul=celular
wemail=spemail
wcpost=spcpos
@23,01 clear to 23,78
@08,49 clear to 13,58
@12,01 get wemail
read
select 1
replace domici   with wdomici
replace locali   with wlocali
replace dpto     with wdpto
replace provin   with wprovin
replace telef    with wtelef
replace tipo     with wtipo
replace spcpos   with wcpost
replace spemail  with wemail
replace celular  with wcelul
return

