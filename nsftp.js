nsFTP=function(){
	var container,currentUploadFolder="";
    var nsFTP={
        version:"0.0.1",
        filePostURL:"",
        getFilesURL:"",
        fileDelURL:"",
        containerId:"",
        iconHeight:"50px",
        iconWidth:"50px",
        folderUpId:"",
        folderIconImage:"",
        breadCrumb:"",
        zoomOnHover:false,
        zoomWidth:"200px",
        loadComplete:false
    };
    nsFTP.init=function(prop){	
    	var obj=JSON.parse(JSON.stringify(prop));
			if(obj.filePostURL)
			nsFTP.filePostURL=obj.filePostURL;	
			if(obj.getFilesURL)
			 nsFTP.getFilesURL=obj.getFilesURL;
			if(obj.fileDelURL)
			 nsFTP.fileDelURL=obj.fileDelURL;
			if(obj.containerId)
			 nsFTP.containerId=obj.containerId;
			if(obj.iconHeight)
			 nsFTP.iconHeight=obj.iconHeight;
			if(obj.folderUpId)
			 nsFTP.folderUpId=obj.folderUpId;
			if(obj.iconWidth)
			 nsFTP.iconWidth=obj.iconWidth;
			if(obj.breadCrumb)
			 nsFTP.breadCrumb=obj.breadCrumb;
			if(obj.folderIconImage)
				 nsFTP.folderIconImage=obj.folderIconImage;
			if(obj.zoomOnHover)
				 nsFTP.zoomOnHover=obj.zoomOnHover;
			if(obj.zoomWidth)
				 nsFTP.zoomWidth=obj.zoomWidth;
					
		
		return nsFTP;
	};
    nsFTP.fillResources=function(inFolder)
	{
    	nsFTP.loadComplete=false;
		var getUrl=nsFTP.getFilesURL,h=nsFTP.iconHeight,w=nsFTP.iconWidth,goUp,breadCrumb;
		var containerAlreadyInFolder="";
		container=$("#"+nsFTP.containerId);
		if(inFolder)
			getUrl+="/"+inFolder;
		
		if(nsFTP.folderUpId){
			goUp=$("#"+nsFTP.folderUpId);
			goUp.hide();
		}
		else
		{
				goUp=$("<span id='goUp'>Go UP</span>");
				
				goUp.hide();
				container.parent().append(goUp);
		}
		
		if(nsFTP.breadCrumb){
			breadCrumb=$("#"+nsFTP.breadCrumb);
			breadCrumb.hide();
		}
		else
			{
				breadCrumb=$("<span id='resBreadcrumb'></span>");
				breadCrumb.css({"color":"#8B0000","font-size":"13px","margin-left":"5px"});
				breadCrumb.hide();				
				container.parent().append(breadCrumb);
			}
		if(inFolder){
				var folderPath=inFolder.replace(/\!!/g,"/");
				breadCrumb.html("/"+folderPath);			
				breadCrumb.show();
				goUp.show();
				goUp.click(function(){
					var arr=inFolder.split("!!");
					var pathToGoTo;					
					if(arr.length==1)
						pathToGoTo="";
					else
						pathToGoTo=arr[arr.length-2];
					nsFTP.fillResources(pathToGoTo);
					currentUploadFolder=pathToGoTo;
				});
		}
		$.ajax({
			url:getUrl+"?"+new Date().getTime(),
			type:"get",
			 cache: false, 
			success:function(data){
				var content=JSON.parse(data);
				containerAlreadyInFolder=content;
				if(content)
					container.html("");
				for(var i=0;i<content.length;i++){
					var item=content[i];
					var fileUrl;
					var newItem=$("<span class='in_item' id='"+item.fileName+"'></span>");
					var newContent=$("<span class='folder_items'></span>");
					var newLabel=$("<span class='under_label'  title='"+item.fileName+"'>"+item.fileName+"</span>");
					newItem.append(newContent);
					newItem.append(newLabel);
					if(item.fileType==1)
						{
							fileUrl=nsFTP.folderIconImage;
							newItem.addClass('isFolder');
						}
					else
						{
							newItem.addClass('isItem');
							fileUrl=item.fileUrl+"?d="+new Date().getTime();
							var id=newItem.attr("id");
							id=id.replace(/\./g,"-");
							newContent.append("<span class='delIt' id='del_"+id+"' toDel='"+newItem.attr("id")+"' style='display:none;'>X</span>");
							var str="";
							if(parseInt(item.fileType)==2){
								str=item.imgWidth+" X "+item.imgHeight+", "+item.fileSize+" kb";								
							}
							else
							{
								str=item.fileSize+" kb";
							}
							newContent.attr("title",str);
						}					
					if(parseInt(item.imgWidth)<70)
							newContent.css({"background":"url("+fileUrl+") no-repeat","background-size":item.imgWidth+"px"});
						else
							newContent.css({"background":"url("+fileUrl+") no-repeat","background-size":"100%"});
					newContent.attr("data-nsimg",fileUrl);
					container.append(newItem);
					
				}
				container.find(".isItem").hover(function(){	
					var id=$(this).attr("id");
					id=id.replace(/\./g,"-");
					$("#del_"+id).show();
					
				},function()
					{

					var id=$(this).attr("id");
					id=id.replace(/\./g,"-");
						$("#del_"+id).hide();
					
				});
				$(".delIt").click(function(){
					var filenametodel=$(this).attr("toDel");
					alertify.confirm("Are you sure you want to delete this file?",function(e){
						if(e)
							nsFTP.deleteFile(filenametodel,currentUploadFolder);
						else
							alertify.log("Deletion of file cancelled");
					});
					
				});
				$(".isFolder").click(function(){
					if(currentUploadFolder!="")
						currentUploadFolder+="!!"+$(this).attr("id");
					else
						currentUploadFolder+=$(this).attr("id");
					nsFTP.fillResources(currentUploadFolder);
				});
				nsFTP.loadComplete=true;
				if(nsFTP.zoomOnHover)
					nsFTP.applyHoverFunction();
			}
		});
		
		
	};
	nsFTP.applyHoverFunction=function(){
		var widthToShow=nsFTP.zoomWidth;
		$("#alreadyContent .isItem .folder_items").each(function(i,e){
			var item=$(e);
			var bgimage=item.attr("data-nsimg");
			var newImage;
			var shown=false;
			item.hover(function(e){					
				if(!shown){
					newImage=$("<img src='"+bgimage+"'>");
					$("body").append(newImage);
					//if(newImage.width()>widthToShow)
						newImage.attr("width",widthToShow+"px");
					newImage.css({
						"position":"fixed",
						"top":e.clientY+12+"px",
						"left":e.clientX+12+"px"						
					});						
					shown=true;
				}
				
			},function(){
				if(shown){						
					newImage.remove();
					shown=false;
				}
			});
			item.mousemove(function(e){
				if(shown){
					newImage.css({
						"top":e.clientY+12+"px",
						"left":e.clientX+12+"px"						
					});
				}
			});
	});
	};
    nsFTP.deleteFile=function(fileToDelete,fromFolder){
    	var delUrl=nsFTP.fileDelURL;
    		if(fromFolder && fromFolder.length>0)
    			delUrl=nsFTP.fileDelURL+"/"+fromFolder;
		$.ajax({
			url:delUrl,
			type:'post',
			data:{'fileToDel':fileToDelete},
			success:function(data){
				 var response=JSON.parse(data);
				    if(response.success)
				    	alertify.success(response.message);
				    else
				    	alertify.error(response.message);				
				nsFTP.fillResources(fromFolder);
			}
		});
	};
    return nsFTP;
}();
